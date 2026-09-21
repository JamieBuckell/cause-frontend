import { httpClient } from "@/api/core/httpClient";
import { requiredPathParam } from "@/api/core/pathParams";

export const createCampaign = async (body) =>
  await httpClient.post(`/campaigns/create`, body);

export const getAllCampaigns = async () =>
  await httpClient.get(`/campaigns/list`);

export const activeCampaigns = async () =>
  await httpClient.get(`/campaigns/verify`);

export const getByCampaign = async (campaignId) =>
  await httpClient.get(
    `/campaigns/get-by-id/${requiredPathParam(campaignId, "campaignId")}`
  );

export const deleteCampaign = async (campaignId) =>
  await httpClient.post(
    `/campaigns/delete/${requiredPathParam(campaignId, "campaignId")}`
  );

export const updateCampaign = async (body) =>
  await httpClient.post(`/campaigns/update`, body);

export const getDashboard = async (campaignId) =>
  await httpClient.get(
    `/campaigns/dashboard/${requiredPathParam(campaignId, "campaignId")}`
  );
