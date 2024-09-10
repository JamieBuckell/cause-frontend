import { httpClient } from "@/api/core/httpClient";

export const createCampaign = async (body) =>
  await httpClient.post(`/campaigns/create`, body);

export const getAllCampaigns = async () =>
  await httpClient.get(`/campaigns/list`);

export const activeCampaigns = async () =>
  await httpClient.get(`/campaigns/verify`);

export const getByCampaign = async (campaignId) =>
  await httpClient.get(`/campaigns/get-by-id/${campaignId}`);

export const deleteCampaign = async (campaignId) =>
  await httpClient.post(`/campaigns/delete/${campaignId}`);

export const updateCampaign = async (body) =>
  await httpClient.post(`/campaigns/update`, body);

export const getDashboard = async (campaignId) =>
  await httpClient.get(`/campaigns/dashboard/${campaignId}`);
