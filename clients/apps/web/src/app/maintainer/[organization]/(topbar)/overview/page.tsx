import { getServerSideAPI } from '@/utils/api'
import { Platforms, SubscriptionTierType } from '@polar-sh/sdk'
import { Metadata, ResolvingMetadata } from 'next'
import ClientPage from './ClientPage'

export async function generateMetadata(
  {
    params,
  }: {
    params: { organization: string }
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: `${params.organization}`, // " | Polar is added by the template"
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { organization: string }
  searchParams: { type?: SubscriptionTierType; subscription_tier_id?: string }
}) {
  const api = getServerSideAPI()
  const organization = await api.organizations.lookup({
    organizationName: params.organization,
    platform: Platforms.GITHUB,
  })

  const startOfMonth = new Date()
  startOfMonth.setUTCHours(0, 0, 0, 0)
  startOfMonth.setUTCDate(1)

  const startOfMonthThreeMonthsAgo = new Date()
  startOfMonthThreeMonthsAgo.setUTCHours(0, 0, 0, 0)
  startOfMonthThreeMonthsAgo.setUTCDate(1)
  startOfMonthThreeMonthsAgo.setUTCMonth(startOfMonth.getMonth() - 2)

  return (
    <ClientPage
      organization={organization}
      startDate={startOfMonthThreeMonthsAgo}
      endDate={startOfMonth}
      subscriptionTierType={searchParams.type}
      subscriptionTierId={searchParams.subscription_tier_id}
    />
  )
}
