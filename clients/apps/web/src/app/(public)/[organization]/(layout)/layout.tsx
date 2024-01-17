import EmptyLayout from '@/components/Layout/EmptyLayout'
import { OrganizationPublicPageNav } from '@/components/Organization/OrganizationPublicPageNav'
import { OrganizationPublicSidebar } from '@/components/Organization/OrganizationPublicSidebar'
import { getServerSideAPI } from '@/utils/api'
import { Organization, Platforms, UserRead } from '@polar-sh/sdk'
import { notFound } from 'next/navigation'
import React from 'react'

const cacheConfig = {
  next: {
    revalidate: 30, // 30 seconds
  },
}

export default async function Layout({
  params,
  children,
}: {
  params: { organization: string }
  children: React.ReactNode
}) {
  const api = getServerSideAPI()

  let organization: Organization | undefined
  let authenticatedUser: UserRead | undefined

  try {
    const [loadOrganization, loadAuthenticatedUser] = await Promise.all([
      api.organizations.lookup(
        {
          platform: Platforms.GITHUB,
          organizationName: params.organization,
        },
        cacheConfig,
      ),
      // Handle unauthenticated
      api.users.getAuthenticated({ cache: 'no-store' }).catch(() => {
        return undefined
      }),
    ])

    organization = loadOrganization
    authenticatedUser = loadAuthenticatedUser
  } catch (e) {
    notFound()
  }

  if (!organization) {
    notFound()
  }

  return (
    <EmptyLayout>
      <div className="flex min-h-screen flex-col justify-between">
        <div className="flex shrink-0 flex-col">
          <div className="mx-auto mt-4 flex w-full max-w-7xl shrink-0 flex-col space-y-8 px-4">
            <div className="flex w-full shrink-0 flex-col gap-8 md:min-h-screen md:flex-row md:gap-24">
              <OrganizationPublicSidebar organization={organization} />
              <div className="-mx-4 flex flex-row overflow-x-auto px-4 pb-4 md:hidden">
                <OrganizationPublicPageNav
                  className="flex-row"
                  organization={organization}
                />
              </div>
              <div className="flex h-full w-full flex-col gap-y-8">
                <OrganizationPublicPageNav
                  className="hidden md:flex"
                  organization={organization}
                />
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmptyLayout>
  )
}
