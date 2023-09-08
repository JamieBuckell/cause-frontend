import { httpClient } from "@/api/core/httpClient";

export const getAllCampaigns = async () =>
  await httpClient.get(`/campaigns/list`);

export const getByCampaign = async (campaignId) =>
  await httpClient.get(`/campaigns/get-by-id/${campaignId}`);
