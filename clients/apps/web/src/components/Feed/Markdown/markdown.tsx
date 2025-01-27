import { AdvertisementCampaignPublic, Article } from '@polar-sh/sdk'
import React, { Fragment } from 'react'

export type RenderArticle = Pick<
  Article,
  | 'title'
  | 'body'
  | 'published_at'
  | 'byline'
  | 'organization'
  | 'slug'
  | 'is_preview'
>

export type BenefitAds = {
  benefitId: string
  ads: Array<AdvertisementCampaignPublic>
}

// strictCreateElement removes unsupported types and attributes
export const wrapStrictCreateElement = (args: {
  article: RenderArticle
  showPaywalledContent?: boolean
  isSubscriber?: boolean
  paidArticlesBenefitName?: string
  defaultOverride?: React.FunctionComponent
  extraAllowedCustomComponents?: string[]
  adsContext?: BenefitAds[]
}): ((
  type:
    | string
    | import('react').FunctionComponent<{}>
    | import('react').ComponentClass<{}, any>,
  props: JSX.IntrinsicAttributes | any,
  children: any,
) => JSX.Element) => {
  console.log(args.extraAllowedCustomComponents)

  const strictCreateElement = (
    type:
      | string
      | import('react').FunctionComponent<{}>
      | import('react').ComponentClass<{}, any>,
    props: JSX.IntrinsicAttributes | any,
    children: any,
  ): JSX.Element => {
    const allowedTypes = [
      'a',
      'b',
      'blockquote',
      'code',
      'del',
      'div',
      'em',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'img',
      'p',
      'pre',
      'strong',
      'sup',
      'table',
      'tbody',
      'th',
      'thead',
      'tr',
      'td',
      'li',
      'ul',
      'ol',
      'footer',
      'hr',
      'span',
      'input',
    ]

    // clean up props, only pass down a limited set of safe props
    let trimProps: typeof props = {
      key: props?.key,
      style: props?.style,
      align: props?.align,
      className: props?.className,
    }

    const allowedCustomComponents = [
      // custom completely overridden components
      'embed',
      'iframe',
      'img',
      'pre',
      // our custom components
      'poll',
      'paywall',
      'subscribenow',
      ...(args.extraAllowedCustomComponents ?? []),
    ].map((s) => s.toLowerCase())

    // Custom components
    if (
      typeof type === 'function' &&
      type?.name &&
      allowedCustomComponents.includes(type?.name.toLowerCase())
    ) {
      const customComponentName = type?.name.toLowerCase()

      if (customComponentName === 'img') {
        trimProps.src = props?.src
        trimProps.height = props?.height
        trimProps.width = props?.width
        children = undefined // can never have children
      }

      if (customComponentName === 'embed') {
        trimProps.src = props?.src
        children = undefined // can never have children
      }

      if (customComponentName === 'iframe') {
        trimProps.src = props?.src
        trimProps.title = props?.title
        trimProps.allow = props?.allow
        children = undefined // can never have children
      }

      if (['subscribenow', 'paywall'].includes(customComponentName)) {
        trimProps.article = args.article
        // Default to true in the client side renderer. When rendering posts for end-users, the premium content is already stripped out by the backend.
        trimProps.showPaywalledContent = args.showPaywalledContent ?? true
        trimProps.isSubscriber = args.isSubscriber ?? false
        trimProps.paidArticlesBenefitName = args.paidArticlesBenefitName
      }

      if (customComponentName === 'ad') {
        trimProps.subscriptionBenefitId = props?.subscriptionBenefitId
        trimProps.adsContext = args.adsContext
      }

      return React.createElement(
        type,
        {
          ...trimProps,
        } as JSX.IntrinsicAttributes,
        children,
      )
    }

    if (typeof type !== 'string') {
      return <></>
    }

    type = type.toLowerCase()

    if (!allowedTypes.includes(type)) {
      return <></>
    }

    if (args.defaultOverride) {
      return React.createElement(args.defaultOverride, {}, props.children)
    }

    if (type === 'a') {
      const href = props?.href
      if (
        typeof href === 'string' &&
        // Restricted protos.
        // Do not allow relative URLs.
        (href.startsWith('https://') ||
          href.startsWith('http://') ||
          href.startsWith('mailto://'))
      ) {
        trimProps.href = props?.href
      } else {
        return <></>
      }
    }

    if (type === 'input') {
      if (props?.type !== 'checkbox') {
        return <></>
      }

      trimProps.type = 'checkbox'
      trimProps.checked = props?.checked
      trimProps.disabled = 'disabled'
      children = undefined // can never have children
    }

    if (type === 'p' && Array.isArray(children)) {
      return React.createElement(
        type,
        trimProps,
        <Fragment>
          {children.map((ch, idx) => {
            // Double whitespace as newline.
            if (typeof ch === 'object' && ch.key === null) {
              return (
                <Fragment key={idx}>
                  <br />
                </Fragment>
              )
            }

            return <Fragment key={idx}>{ch}</Fragment>
          })}
        </Fragment>,
      )
    }

    if (Array.isArray(children)) {
      return React.createElement(
        type,
        trimProps,
        <Fragment>
          {children.map((ch, idx) => (
            <Fragment key={idx}>{ch}</Fragment>
          ))}
        </Fragment>,
      )
    }

    return React.createElement(
      type,

      trimProps,
      children,
    )
  }

  return strictCreateElement
}

export const markdownOpts = {
  disableParsingRawHTML: false,
  forceBlock: true,
  overrides: {
    // Do not render by default.
    // The web and email renderers will register their corresponding implementations
    poll: () => <></>,
    Paywall: () => <></>,
    SubscribeNow: () => <></>,
    embed: () => <></>,
    iframe: () => <></>,

    // example style overrides
    img: (args: any) => <img {...args} style={{ maxWidth: '100%' }} />,
  },
} as const
