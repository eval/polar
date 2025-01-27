import { useDiscordAccount } from '@/hooks'
import { ArrowForwardOutlined, LinkOutlined } from '@mui/icons-material'
import { SvgIconTypeMap } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { useRouter } from 'next/navigation'
import { useOrganization } from 'polarkit/hooks'
import { BenefitSubscriber } from './Benefit'

interface BenefitAction {
  icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
    muiName: string
  }
  onClick: () => void
  key: string
}

export const useBenefitActions = (
  benefit: BenefitSubscriber,
): BenefitAction[] => {
  const router = useRouter()
  const { data: organization } = useOrganization(benefit.organization_id ?? '')
  const discordAccount = useDiscordAccount()

  switch (benefit.type) {
    case 'articles':
      return [
        {
          key: 'article',
          icon: ArrowForwardOutlined,
          onClick: () => {
            router.push(`/${organization?.name}`)
          },
        },
      ]
    case 'discord':
      return [
        ...(discordAccount
          ? [
              {
                key: 'discord_link',
                icon: LinkOutlined,
                onClick: () => {
                  window.open(
                    `https://www.discord.com/channels/${benefit.properties.guild_id}`,
                  )
                },
              },
            ]
          : []),
      ]
    default:
      return []
  }
}
