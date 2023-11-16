import { httpClient } from "@/api/core/httpClient";

export const getHamperScreen = async (campaignId) =>
  await httpClient.get(`/hampers/screen/${campaignId}`);
