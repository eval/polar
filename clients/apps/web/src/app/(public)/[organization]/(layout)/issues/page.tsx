import IssuesLookingForFunding from '@/components/Organization/IssuesLookingForFunding'
import {
  FilterSearchParams,
  buildFundingFilters,
  urlSearchFromObj,
} from '@/components/Organization/filters'
import { getServerSideAPI } from '@/utils/api'
import { Organization, Platforms, ResponseError } from '@polar-sh/sdk'
import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { ShadowBoxOnMd } from 'polarkit/components/ui/atoms'

const cacheConfig = {
  next: {
    revalidate: 30, // 30 seconds
  },
}

export async function generateMetadata(
  {
    params,
  }: {
    params: { organization: string }
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  let organization: Organization | undefined

  const api = getServerSideAPI()

  try {
    organization = await api.organizations.lookup(
      {
        platform: Platforms.GITHUB,
        organizationName: params.organization,
      },
      cacheConfig,
    )
  } catch (e) {
    if (e instanceof ResponseError && e.response.status === 404) {
      notFound()
    }
    throw e
  }

  if (!organization) {
    notFound()
  }

  return {
    title: `${organization.name}`, // " | Polar is added by the template"
    openGraph: {
      title: `${organization.name} seeks funding for issues`,
      description: `${organization.name} seeks funding for issues on Polar`,
      siteName: 'Polar',

      images: [
        {
          url: `https://polar.sh/og?org=${organization.name}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `https://polar.sh/og?org=${organization.name}`,
          width: 1200,
          height: 630,
          alt: `${organization.name} seeks funding for issues`,
        },
      ],
      card: 'summary_large_image',
      title: `${organization.name} seeks funding for issues`,
      description: `${organization.name} seeks funding for issues on Polar`,
    },
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { organization: string }
  searchParams: FilterSearchParams
}) {
  const api = getServerSideAPI()
  const filters = buildFundingFilters(urlSearchFromObj(searchParams))

  const [organization, issues] = await Promise.all([
    api.organizations.lookup(
      {
        platform: Platforms.GITHUB,
        organizationName: params.organization,
      },
      cacheConfig,
    ),
    api.funding.search(
      {
        platform: Platforms.GITHUB,
        organizationName: params.organization,
        query: filters.q,
        sorting: filters.sort,
        badged: filters.badged,
        limit: 20,
        closed: filters.closed,
        page: searchParams.page ? parseInt(searchParams.page) : 1,
      },
      cacheConfig,
    ),
  ])

  if (!organization) {
    notFound()
  }

  return (
    <div className="flex w-full flex-col gap-y-8">
      <ShadowBoxOnMd>
        <div className="p-4">
          <div className="flex flex-row items-start justify-between pb-8">
            <h2 className="text-lg font-medium">Issues looking for funding</h2>
          </div>
          <IssuesLookingForFunding
            organization={organization}
            issues={issues}
          />
        </div>
      </ShadowBoxOnMd>
    </div>
  )
}
