import { httpClientV2 } from '@/api/core/httpClient'

export const getAllCampaigns = async () =>
  await httpClientV2.get(`/campaigns/list`)
