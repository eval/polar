import uuid
from datetime import date, datetime
from typing import Literal, Self

import stripe as stripe_lib
from pydantic import (
    UUID4,
    AnyHttpUrl,
    EmailStr,
    Field,
    computed_field,
    field_validator,
    model_validator,
)

from polar.config import settings
from polar.enums import Platforms
from polar.kit import jwt
from polar.kit.schemas import EmptyStrToNone, Schema, TimestampedSchema
from polar.models.subscription import SubscriptionStatus
from polar.models.subscription_benefit import SubscriptionBenefitType
from polar.models.subscription_tier import SubscriptionTier as SubscriptionTierModel
from polar.models.subscription_tier import SubscriptionTierType

TIER_NAME_MIN_LENGTH = 3
TIER_NAME_MAX_LENGTH = 24
TIER_DESCRIPTION_MAX_LENGTH = 240
BENEFIT_DESCRIPTION_MIN_LENGTH = 3
BENEFIT_DESCRIPTION_MAX_LENGTH = 42

# SubscriptionBenefitProperties


class SubscriptionBenefitProperties(Schema):
    ...


class SubscriptionBenefitArticlesProperties(Schema):
    paid_articles: bool


class SubscriptionBenefitArticlesSubscriberProperties(Schema):
    paid_articles: bool


class SubscriptionBenefitAdsProperties(Schema):
    image_height: int = 400
    image_width: int = 400


class SubscriptionBenefitDiscordProperties(Schema):
    guild_id: str
    role_id: str

    @computed_field  # type: ignore[misc]
    @property
    def guild_token(self) -> str:
        return jwt.encode(data={"guild_id": self.guild_id}, secret=settings.SECRET)


class SubscriptionBenefitDiscordCreateProperties(Schema):
    guild_token: str = Field(serialization_alias="guild_id")
    role_id: str

    @field_validator("guild_token")
    @classmethod
    def validate_guild_token(cls, v: str) -> str:
        try:
            guild_token_data = jwt.decode(token=v, secret=settings.SECRET)
            return guild_token_data["guild_id"]
        except (KeyError, jwt.DecodeError, jwt.ExpiredSignatureError) as e:
            raise ValueError(
                "Invalid token. Please authenticate your Discord server again."
            ) from e


class SubscriptionBenefitDiscordSubscriberProperties(Schema):
    guild_id: str


class SubscriptionBenefitCustomProperties(Schema):
    note: str | None = None


class SubscriptionBenefitCustomSubscriberProperties(Schema):
    note: str | None = None


# SubscriptionBenefitCreate


class SubscriptionBenefitCreateBase(Schema):
    description: str = Field(
        ...,
        min_length=BENEFIT_DESCRIPTION_MIN_LENGTH,
        max_length=BENEFIT_DESCRIPTION_MAX_LENGTH,
    )
    organization_id: UUID4 | None = None
    repository_id: UUID4 | None = None

    @model_validator(mode="after")
    def check_either_organization_or_repository(self) -> Self:
        if self.organization_id is not None and self.repository_id is not None:
            raise ValueError(
                "Subscription benefits should either be linked to "
                "an Organization or a Repository, not both."
            )
        if self.organization_id is None and self.repository_id is None:
            raise ValueError(
                "Subscription benefits should be linked to "
                "an Organization or a Repository."
            )
        return self


class SubscriptionBenefitCustomCreate(SubscriptionBenefitCreateBase):
    type: Literal[SubscriptionBenefitType.custom]
    is_tax_applicable: bool
    properties: SubscriptionBenefitCustomProperties


class SubscriptionBenefitAdsCreate(SubscriptionBenefitCreateBase):
    type: Literal[SubscriptionBenefitType.ads]
    properties: SubscriptionBenefitAdsProperties


class SubscriptionBenefitDiscordCreate(SubscriptionBenefitCreateBase):
    type: Literal[SubscriptionBenefitType.discord]
    properties: SubscriptionBenefitDiscordCreateProperties


SubscriptionBenefitCreate = (
    SubscriptionBenefitCustomCreate
    | SubscriptionBenefitAdsCreate
    | SubscriptionBenefitDiscordCreate
)


# SubscriptionBenefitUpdate


class SubscriptionBenefitUpdateBase(Schema):
    description: str | None = Field(
        None,
        min_length=BENEFIT_DESCRIPTION_MIN_LENGTH,
        max_length=BENEFIT_DESCRIPTION_MAX_LENGTH,
    )


class SubscriptionBenefitArticlesUpdate(SubscriptionBenefitUpdateBase):
    # Don't allow to update properties, as both Free and Premium posts
    # are pre-created by us and shouldn't change
    type: Literal[SubscriptionBenefitType.articles]


class SubscriptionBenefitAdsUpdate(SubscriptionBenefitUpdateBase):
    type: Literal[SubscriptionBenefitType.ads]
    properties: SubscriptionBenefitAdsProperties | None = None


class SubscriptionBenefitCustomUpdate(SubscriptionBenefitUpdateBase):
    type: Literal[SubscriptionBenefitType.custom]
    properties: SubscriptionBenefitCustomProperties | None = None


class SubscriptionBenefitDiscordUpdate(SubscriptionBenefitUpdateBase):
    type: Literal[SubscriptionBenefitType.discord]
    properties: SubscriptionBenefitDiscordCreateProperties | None = None


SubscriptionBenefitUpdate = (
    SubscriptionBenefitArticlesUpdate
    | SubscriptionBenefitAdsUpdate
    | SubscriptionBenefitCustomUpdate
    | SubscriptionBenefitDiscordUpdate
)


# SubscriptionBenefit


class SubscriptionBenefitBase(TimestampedSchema):
    id: UUID4
    type: SubscriptionBenefitType
    description: str
    selectable: bool
    deletable: bool
    organization_id: UUID4 | None = None
    repository_id: UUID4 | None = None


class SubscriptionBenefitArticles(SubscriptionBenefitBase):
    type: Literal[SubscriptionBenefitType.articles]
    properties: SubscriptionBenefitArticlesProperties


class SubscriptionBenefitAds(SubscriptionBenefitBase):
    type: Literal[SubscriptionBenefitType.ads]
    properties: SubscriptionBenefitAdsProperties


class SubscriptionBenefitDiscord(SubscriptionBenefitBase):
    type: Literal[SubscriptionBenefitType.discord]
    properties: SubscriptionBenefitDiscordProperties


class SubscriptionBenefitCustom(SubscriptionBenefitBase):
    type: Literal[SubscriptionBenefitType.custom]
    properties: SubscriptionBenefitCustomProperties
    is_tax_applicable: bool


SubscriptionBenefit = (
    SubscriptionBenefitArticles
    | SubscriptionBenefitAds
    | SubscriptionBenefitCustom
    | SubscriptionBenefitDiscord
)

subscription_benefit_schema_map: dict[
    SubscriptionBenefitType, type[SubscriptionBenefit]
] = {
    SubscriptionBenefitType.discord: SubscriptionBenefitDiscord,
    SubscriptionBenefitType.articles: SubscriptionBenefitArticles,
    SubscriptionBenefitType.ads: SubscriptionBenefitAds,
    SubscriptionBenefitType.custom: SubscriptionBenefitCustom,
}

# SubscriptionBenefitSubscriber


class SubscriptionBenefitArticlesSubscriber(SubscriptionBenefitBase):
    type: Literal[SubscriptionBenefitType.articles]
    properties: SubscriptionBenefitArticlesSubscriberProperties


class SubscriptionBenefitAdsSubscriber(SubscriptionBenefitBase):
    type: Literal[SubscriptionBenefitType.ads]
    properties: SubscriptionBenefitAdsProperties


class SubscriptionBenefitDiscordSubscriber(SubscriptionBenefitBase):
    type: Literal[SubscriptionBenefitType.discord]
    properties: SubscriptionBenefitDiscordSubscriberProperties


class SubscriptionBenefitCustomSubscriber(SubscriptionBenefitBase):
    type: Literal[SubscriptionBenefitType.custom]
    properties: SubscriptionBenefitCustomSubscriberProperties


# Properties that are available to subscribers only
SubscriptionBenefitSubscriber = (
    SubscriptionBenefitArticlesSubscriber
    | SubscriptionBenefitAdsSubscriber
    | SubscriptionBenefitDiscordSubscriber
    | SubscriptionBenefitCustomSubscriber
)

# Properties that are public (included in Subscription Tier endpoints)
SubscriptionBenefitPublic = SubscriptionBenefitBase | SubscriptionBenefitArticles

# SubscriptionTier

# Ref: https://stripe.com/docs/api/payment_intents/object#payment_intent_object-amount
MAXIMUM_PRICE_AMOUNT = 99999999


class SubscriptionTierCreate(Schema):
    type: Literal[
        SubscriptionTierType.individual,
        SubscriptionTierType.business,
    ]
    name: str = Field(
        ..., min_length=TIER_NAME_MIN_LENGTH, max_length=TIER_NAME_MAX_LENGTH
    )
    description: EmptyStrToNone = Field(
        default=None, max_length=TIER_DESCRIPTION_MAX_LENGTH
    )
    is_highlighted: bool = False
    price_amount: int = Field(..., gt=0, le=MAXIMUM_PRICE_AMOUNT)
    price_currency: str = Field("USD", pattern="USD")
    organization_id: UUID4 | None = None
    repository_id: UUID4 | None = None

    @model_validator(mode="after")
    def check_either_organization_or_repository(self) -> Self:
        if self.organization_id is not None and self.repository_id is not None:
            raise ValueError(
                "Subscription tiers should either be linked to "
                "an Organization or a Repository, not both."
            )
        if self.organization_id is None and self.repository_id is None:
            raise ValueError(
                "Subscription tiers should be linked to "
                "an Organization or a Repository."
            )
        return self


class SubscriptionTierUpdate(Schema):
    name: str | None = Field(
        default=None, min_length=TIER_NAME_MIN_LENGTH, max_length=TIER_NAME_MAX_LENGTH
    )
    description: EmptyStrToNone = Field(
        default=None, max_length=TIER_DESCRIPTION_MAX_LENGTH
    )
    is_highlighted: bool | None = None
    price_amount: int | None = Field(default=None, gt=0, le=MAXIMUM_PRICE_AMOUNT)
    price_currency: str | None = Field(default=None, pattern="USD")


class SubscriptionTierBenefitsUpdate(Schema):
    benefits: list[UUID4]


class SubscriptionTierBenefit(SubscriptionBenefitBase):
    ...


class SubscriptionTierBase(TimestampedSchema):
    id: UUID4
    type: SubscriptionTierType
    name: str
    description: str | None = None
    is_highlighted: bool
    price_amount: int
    price_currency: str
    is_archived: bool
    organization_id: UUID4 | None = None
    repository_id: UUID4 | None = None


class SubscriptionTier(SubscriptionTierBase):
    benefits: list[SubscriptionBenefitPublic]


class SubscriptionTierSubscriber(SubscriptionTierBase):
    benefits: list[SubscriptionBenefitSubscriber]


# SubscribeSession


class SubscribeSessionCreate(Schema):
    tier_id: UUID4 = Field(
        ...,
        description="ID of the Subscription Tier to subscribe to.",
    )
    success_url: AnyHttpUrl = Field(
        ...,
        description=(
            "URL where the backer will be redirected after a successful subscription. "
            "You can add the `session_id={CHECKOUT_SESSION_ID}` query parameter "
            "to retrieve the subscribe session id."
        ),
    )
    organization_subscriber_id: UUID4 | None = Field(
        None,
        description=(
            "ID of the Organization on behalf which you want to subscribe this tier to. "
            "You need to be an administrator of the Organization to do this."
        ),
    )
    customer_email: EmailStr | None = Field(
        None,
        description=(
            "If you already know the email of your backer, you can set it. "
            "It'll be pre-filled on the subscription page."
        ),
    )


class SubscribeSession(Schema):
    id: str = Field(
        ...,
        description=("ID of the subscribe session."),
    )
    url: str | None = Field(
        None,
        description=(
            "URL where you should redirect your backer "
            "so they can subscribe to the selected tier."
        ),
    )
    customer_email: str | None = None
    customer_name: str | None = None
    organization_subscriber_id: UUID4 | None = None
    subscription_tier: SubscriptionTier
    organization_name: str | None = None
    repository_name: str | None = None

    @classmethod
    def from_db(
        cls,
        checkout_session: stripe_lib.checkout.Session,
        subscription_tier: SubscriptionTierModel,
    ) -> Self:
        organization_subscriber_id: uuid.UUID | None = None
        if checkout_session.metadata:
            try:
                organization_subscriber_id = uuid.UUID(
                    checkout_session.metadata["organization_subscriber_id"]
                )
            except (KeyError, ValueError):
                pass

        return cls(
            id=checkout_session.id,
            url=checkout_session.url,
            customer_email=checkout_session.customer_details["email"]
            if checkout_session.customer_details
            else checkout_session.customer_email,
            customer_name=checkout_session.customer_details["name"]
            if checkout_session.customer_details
            else None,
            organization_subscriber_id=organization_subscriber_id,
            subscription_tier=subscription_tier,  # type: ignore
            organization_name=subscription_tier.organization.name
            if subscription_tier.organization is not None
            else None,
            repository_name=subscription_tier.repository.name
            if subscription_tier.repository is not None
            else None,
        )


# Subscriptions


class SubscriptionPublicUser(Schema):
    public_name: str
    github_username: str | None = None
    avatar_url: str | None = None


class SubscriptionUser(SubscriptionPublicUser):
    email: str


class SubscriptionOrganization(Schema):
    name: str
    platform: Platforms
    avatar_url: str


class SubscriptionBase(TimestampedSchema):
    id: UUID4
    status: SubscriptionStatus
    current_period_start: datetime
    current_period_end: datetime | None = None
    cancel_at_period_end: bool
    started_at: datetime | None = None
    ended_at: datetime | None = None

    price_currency: str
    price_amount: int

    user_id: UUID4
    organization_id: UUID4 | None = None
    subscription_tier_id: UUID4


class Subscription(SubscriptionBase):
    user: SubscriptionUser
    organization: SubscriptionOrganization | None = None
    subscription_tier: SubscriptionTier


class SubscriptionSubscriber(SubscriptionBase):
    subscription_tier: SubscriptionTierSubscriber
    organization: SubscriptionOrganization | None = None


class FreeSubscriptionCreate(Schema):
    tier_id: UUID4 = Field(
        ...,
        description="ID of the free Subscription Tier to subscribe to.",
    )
    customer_email: EmailStr | None = Field(
        None,
        description=(
            "Email of your backer. "
            "This field is required if the API is called outside the Polar app."
        ),
    )


class SubscriptionUpgrade(Schema):
    subscription_tier_id: UUID4


class SubscriptionSummary(Schema):
    user: SubscriptionPublicUser
    organization: SubscriptionOrganization | None = None
    subscription_tier: SubscriptionTier


class SubscriptionsStatisticsPeriod(Schema):
    start_date: date
    end_date: date
    subscribers: int
    mrr: int
    cumulative: int


class SubscriptionsStatistics(Schema):
    periods: list[SubscriptionsStatisticsPeriod]


class SubscriptionsImported(Schema):
    count: int
