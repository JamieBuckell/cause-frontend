import { httpClient } from "@/api/core/httpClient";

export const getDropOffsReport = async (campaignId, day) =>
  await httpClient.get(`/reports/drop-offs/${campaignId}/${day}`);

export const getAllDropOffsReport = async (campaignId) =>
  await httpClient.get(`/reports/all-drop-offs/${campaignId}`);
