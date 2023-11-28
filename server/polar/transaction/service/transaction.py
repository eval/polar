import uuid
from collections.abc import Sequence
from enum import StrEnum
from typing import Any, cast

from sqlalchemy import UnaryExpression, asc, desc, func, select
from sqlalchemy.orm import joinedload, subqueryload

from polar.authz.service import AccessType, Authz
from polar.exceptions import NotPermitted, ResourceNotFound
from polar.kit.pagination import PaginationParams, paginate
from polar.kit.sorting import Sorting
from polar.models import (
    Account,
    Issue,
    Pledge,
    Subscription,
    Transaction,
    User,
)
from polar.models.transaction import TransactionType
from polar.postgres import AsyncSession

from ..schemas import (
    TransactionsBalance,
    TransactionsSummary,
)
from .base import BaseTransactionService


class SearchSortProperty(StrEnum):
    created_at = "created_at"
    amount = "amount"


class TransactionService(BaseTransactionService):
    async def search(
        self,
        session: AsyncSession,
        user: User,
        account: Account,
        authz: Authz,
        *,
        type: TransactionType | None = None,
        pagination: PaginationParams,
        sorting: list[Sorting[SearchSortProperty]] = [
            (SearchSortProperty.created_at, True)
        ],
    ) -> tuple[Sequence[Transaction], int]:
        if not await authz.can(user, AccessType.read, account):
            raise NotPermitted()

        statement = (
            select(Transaction)
            .options(
                # Pledge
                subqueryload(Transaction.pledge).options(
                    # Pledge.issue
                    joinedload(Pledge.issue).options(
                        joinedload(Issue.repository),
                        joinedload(Issue.organization),
                    )
                ),
                # IssueReward
                subqueryload(Transaction.issue_reward),
                # Subscription
                subqueryload(Transaction.subscription).options(
                    joinedload(Subscription.subscription_tier),
                ),
            )
            .where(Transaction.account_id == account.id)
        )

        if type is not None:
            statement = statement.where(Transaction.type == type)

        order_by_clauses: list[UnaryExpression[Any]] = []
        for criterion, is_desc in sorting:
            clause_function = desc if is_desc else asc
            if criterion == SearchSortProperty.created_at:
                order_by_clauses.append(clause_function(Transaction.created_at))
            elif criterion == SearchSortProperty.amount:
                order_by_clauses.append(clause_function(Transaction.amount))

        results, count = await paginate(session, statement, pagination=pagination)

        return results, count

    async def lookup(
        self,
        session: AsyncSession,
        id: uuid.UUID,
        user: User,
        authz: Authz,
    ) -> Transaction:
        statement = (
            select(Transaction)
            .where(Transaction.id == id, Transaction.account_id.is_not(None))
            .options(
                # Account
                joinedload(Transaction.account),
                # Pledge
                subqueryload(Transaction.pledge).options(
                    # Pledge.issue
                    joinedload(Pledge.issue).options(
                        joinedload(Issue.repository),
                        joinedload(Issue.organization),
                    )
                ),
                # IssueReward
                subqueryload(Transaction.issue_reward),
                # Subscription
                subqueryload(Transaction.subscription).options(
                    joinedload(Subscription.subscription_tier),
                ),
                # Paid transactions
                subqueryload(Transaction.paid_transactions),
            )
        )
        result = await session.execute(statement)
        transaction = result.scalar_one_or_none()
        if transaction is None:
            raise ResourceNotFound()

        assert transaction.account is not None
        if not await authz.can(user, AccessType.read, transaction.account):
            raise ResourceNotFound()

        return transaction

    async def get_summary(
        self, session: AsyncSession, user: User, account: Account, authz: Authz
    ) -> TransactionsSummary:
        if not await authz.can(user, AccessType.read, account):
            raise NotPermitted()

        statement = (
            select(
                Transaction.currency,
                Transaction.account_currency,
                cast(type[int], func.coalesce(func.sum(Transaction.amount), 0)),
                cast(type[int], func.coalesce(func.sum(Transaction.account_amount), 0)),
                cast(
                    type[int],
                    func.coalesce(
                        func.sum(Transaction.amount).filter(
                            Transaction.type == TransactionType.payout
                        ),
                        0,
                    ),
                ),
                cast(
                    type[int],
                    func.coalesce(
                        func.sum(Transaction.account_amount).filter(
                            Transaction.type == TransactionType.payout
                        ),
                        0,
                    ),
                ),
            )
            .where(Transaction.account_id == account.id)
            .group_by(Transaction.currency, Transaction.account_currency)
        )

        result = await session.execute(statement)
        (
            currency,
            account_currency,
            amount,
            account_amount,
            payout_amount,
            account_payout_amount,
        ) = result.one()._tuple()

        return TransactionsSummary(
            balance=TransactionsBalance(
                currency=currency,
                amount=amount,
                account_currency=account_currency,
                account_amount=account_amount,
            ),
            payout=TransactionsBalance(
                currency=currency,
                amount=payout_amount,
                account_currency=account_currency,
                account_amount=account_payout_amount,
            ),
        )


transaction = TransactionService(Transaction)