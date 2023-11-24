import {
  Article,
  ArticleCreate,
  ArticleUpdate,
  ListResourceArticle,
  Platforms,
} from '@polar-sh/sdk'
import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { api, queryClient } from '../../api'
import { defaultRetry } from './retry'

export const useOrganizationArticles = (
  orgName?: string,
  platform: Platforms = Platforms.GITHUB,
): UseQueryResult<ListResourceArticle> =>
  useQuery({
    queryKey: ['article', 'organization', orgName],
    queryFn: () =>
      api.articles.search({
        organizationName: orgName || '',
        platform,
      }),
    retry: defaultRetry,
    enabled: !!orgName,
  })

export const useCreateArticle = (): UseMutationResult<
  Article,
  Error,
  ArticleCreate,
  unknown
> =>
  useMutation({
    mutationFn: (articleCreate: ArticleCreate) =>
      api.articles.create({
        articleCreate,
      }),
    onSuccess: (result, variables, ctx) => {
      queryClient.invalidateQueries({
        queryKey: ['article', 'organization', result.organization.name],
      })
    },
  })

export const useUpdateArticle = () =>
  useMutation({
    mutationFn: (variables: { id: string; articleUpdate: ArticleUpdate }) =>
      api.articles.update({
        id: variables.id,
        articleUpdate: variables.articleUpdate,
      }),
    onSuccess: (result, variables, ctx) => {
      queryClient.invalidateQueries({
        queryKey: ['article', 'organization', result.organization.name],
      })
      queryClient.invalidateQueries({
        queryKey: ['article', 'id', result.id],
      })
    },
  })

export const useArticle = (id: string) =>
  useQuery({
    queryKey: ['article', 'id', id],
    queryFn: () => api.articles.get({ id }),
    retry: defaultRetry,
    enabled: !!id,
  })

export const useArticleLookup = (organization_name?: string, slug?: string) =>
  useQuery({
    queryKey: ['article', 'lookup', organization_name, slug],
    queryFn: () =>
      api.articles.lookup({
        platform: Platforms.GITHUB,
        organizationName: organization_name || '',
        slug: slug || '',
      }),
    retry: defaultRetry,
    enabled: !!organization_name && !!slug,
  })