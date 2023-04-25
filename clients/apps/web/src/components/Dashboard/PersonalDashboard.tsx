import DashboardLayout from 'components/Layout/DashboardLayout'
import OnboardingConnectPersonalDashboard from 'components/Onboarding/OnboardingConnectDashboard'
import { IssueStatus } from 'polarkit/api/client'
import { IssueReadWithRelations } from 'polarkit/api/types'
import { usePersonalDashboard } from 'polarkit/hooks'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import yayson from 'yayson'
import IssueList from './IssueList'
import { DashboardFilters } from './filters'

const y = yayson({ adapter: 'default' })
const store = new y.Store()

const PersonalDashboard = ({
  filters,
  statuses,
  onSetFilters,
}: {
  filters: DashboardFilters
  statuses: Array<IssueStatus>
  onSetFilters: Dispatch<SetStateAction<DashboardFilters>>
}) => {
  const dashboardQuery = usePersonalDashboard(
    filters.tab,
    filters.q,
    statuses,
    filters.sort,
    filters.onlyPledged,
  )
  const dashboard = dashboardQuery.data

  const [issues, setIssues] = useState<IssueReadWithRelations[]>()

  useEffect(() => {
    if (dashboard) {
      const issues: IssueReadWithRelations[] = store.sync(dashboard)
      setIssues(issues)
    } else {
      setIssues([])
    }
  }, [dashboard])

  return (
    <DashboardLayout
      filters={filters}
      onSetFilters={onSetFilters}
      showSidebar={true}
      isPersonalDashboard={true}
    >
      <div className="space-y-4">
        <OnboardingConnectPersonalDashboard />
        <IssueList
          loading={dashboardQuery.isLoading}
          issues={issues}
          filters={filters}
          onSetFilters={onSetFilters}
        />
      </div>
    </DashboardLayout>
  )
}

export default PersonalDashboard
