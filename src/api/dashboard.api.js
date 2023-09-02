import { httpClient } from '@/api/core/httpClient'
import { httpClientV2 } from '@/api/core/httpClient'

export const getDashData = async (campaignId) =>
  await httpClient.get(`/dashboard/overview/${campaignId}`)

export const getHamperScreen = async () =>
  await httpClientV2.get(`/hampers/screen`)
