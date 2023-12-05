'use client'

import { AnimatedIconButton } from '@/components/Feed/Posts/Post'
import { DashboardBody } from '@/components/Layout/DashboardLayout'
import { StaggerReveal } from '@/components/Shared/StaggerReveal'
import { SubscriptionsChart } from '@/components/Subscriptions/SubscriptionsChart'
import { useCurrentOrgAndRepoFromURL } from '@/hooks'
import { EyeIcon, PhotoIcon } from '@heroicons/react/24/outline'
import {
  AddOutlined,
  ArrowForward,
  LanguageOutlined,
} from '@mui/icons-material'
import { Article } from '@polar-sh/sdk'
import Link from 'next/link'
import { Button, Card, PolarTimeAgo } from 'polarkit/components/ui/atoms'
import {
  useOrganizationArticles,
  useSubscriptionStatistics,
  useSubscriptionSummary,
} from 'polarkit/hooks'
import { useMemo, useRef } from 'react'
import { useHoverDirty } from 'react-use'

const startOfMonth = new Date()
startOfMonth.setUTCHours(0, 0, 0, 0)
startOfMonth.setUTCDate(1)

const startOfMonthSixMonthsAgo = new Date()
startOfMonthSixMonthsAgo.setUTCHours(0, 0, 0, 0)
startOfMonthSixMonthsAgo.setUTCDate(1)
startOfMonthSixMonthsAgo.setUTCMonth(startOfMonth.getMonth() - 2)

const ClientPage = () => {
  const { org } = useCurrentOrgAndRepoFromURL()

  const posts = useOrganizationArticles(org?.name)

  const summary = useSubscriptionSummary(org?.name ?? '')
  const subscriptionStatistics = useSubscriptionStatistics(
    org?.name ?? '',
    startOfMonthSixMonthsAgo,
    startOfMonth,
  )

  return (
    <>
      <DashboardBody>
        <div className="items mb-24 flex flex-row items-start gap-x-12">
          <div className="flex w-2/3 flex-col gap-y-8">
            <div className="flex w-full flex-row items-center justify-between">
              <h3 className="dark:text-polar-50 text-lg font-medium text-gray-950">
                Overview
              </h3>
              <Link href={`/maintainer/${org?.name}/posts/new`}>
                <Button className="h-8 w-8 rounded-full">
                  <AddOutlined fontSize="inherit" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-y-12">
              <StaggerReveal className="flex w-full flex-col gap-y-6">
                {posts?.data?.items
                  ? posts.data.items.map((post) => (
                      <StaggerReveal.Child key={post.id}>
                        <PostItem {...post} />
                      </StaggerReveal.Child>
                    ))
                  : null}
              </StaggerReveal>
            </div>
          </div>
          <div className="flex w-1/3 flex-col gap-y-8">
            <div className="flex w-full flex-grow flex-row items-center justify-between">
              <h3 className="dark:text-polar-50 text-lg text-gray-950">
                Analytics
              </h3>
            </div>
            {subscriptionStatistics.data && (
              <Card className="flex flex-col gap-y-4 rounded-3xl p-4">
                <div className="flex w-full flex-grow flex-row items-center justify-between">
                  <h3 className="p-2 text-sm font-medium">Subscribers</h3>
                  <h3 className="p-2 text-sm">
                    {summary.data?.pagination.total_count}
                  </h3>
                </div>
                <SubscriptionsChart
                  y="subscribers"
                  axisYOptions={{
                    ticks: 'month',
                    label: null,
                  }}
                  data={subscriptionStatistics.data.periods.map((d) => ({
                    ...d,
                    parsedStartDate: new Date(d.start_date),
                  }))}
                />
              </Card>
            )}
          </div>
        </div>
      </DashboardBody>
    </>
  )
}

export default ClientPage

const PostItem = (post: Article) => {
  const ref = useRef<HTMLAnchorElement>(null)
  const { org: currentOrg } = useCurrentOrgAndRepoFromURL()
  const isHovered = useHoverDirty(ref)

  const description = useMemo(() => post.body.split('. ')[0], [post])

  const image = post.body.match(/!\[.*?\]\((.*?)\)/)?.[1]

  return (
    <Link
      className="flex h-full w-full flex-col"
      ref={ref}
      href={`/maintainer/${currentOrg?.name}/posts/${post.slug}`}
    >
      <div className="dark:bg-polar-900 dark:border-polar-700 dark:hover:bg-polar-800 flex flex-row justify-between gap-x-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-colors hover:bg-gray-50">
        {image ? (
          <div
            className="flex min-h-0 w-28 flex-shrink-0 flex-col rounded-2xl bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${image})` }}
          />
        ) : (
          <div className="bg-polar-100 flex min-h-0 w-28 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-cover bg-center bg-no-repeat">
            <PhotoIcon className="text-polar-400 h-8 w-8" />
          </div>
        )}
        <div className="flex min-w-0 flex-grow flex-col gap-y-6">
          <div className="flex w-full flex-col gap-y-2">
            <h3 className="text-md dark:text-polar-50 font-medium text-gray-950">
              {post.title}
            </h3>
            <p className="dark:text-polar-500 min-w-0 truncate text-gray-500">
              {description}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="dark:text-polar-300 flex w-full flex-row gap-x-3 text-sm text-gray-500">
              {post.published_at ? (
                <PolarTimeAgo date={new Date(post.published_at)} />
              ) : (
                <span>Not published</span>
              )}
              &middot;
              {post.visibility !== 'public' ? (
                <div className="flex flex-row items-center gap-x-2 text-sm">
                  {/* <SubscriptionGroupIcon type={post.visibility} /> */}
                  <span className="capitalize">{post.visibility}</span>
                </div>
              ) : (
                <div className="flex flex-row items-center gap-x-2 text-sm">
                  <LanguageOutlined
                    className="text-blue-500"
                    fontSize="inherit"
                  />
                  <span className="capitalize">{post.visibility}</span>
                </div>
              )}
              {post.web_view_count !== undefined ? (
                <>
                  &middot;
                  <div className="flex flex-row items-center gap-x-2 text-sm">
                    <EyeIcon className="h-4 w-4" />
                    <span>
                      {`${post.web_view_count} ${
                        post.web_view_count === 1 ? 'view' : 'views'
                      }`}
                    </span>
                  </div>
                </>
              ) : null}
              {post.notifications_sent_at ? (
                <div>sent_at={post.notifications_sent_at}</div>
              ) : null}
              {post.email_sent_to_count ? (
                <div>email_sent_to_count={post.email_sent_to_count}</div>
              ) : null}
            </div>
            <div className="flex flex-row items-center gap-x-4">
              <AnimatedIconButton active={isHovered} variant="secondary">
                <ArrowForward fontSize="inherit" />
              </AnimatedIconButton>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
