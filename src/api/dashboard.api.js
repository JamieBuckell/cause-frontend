import { httpClient } from "@/api/core/httpClient";
import { requiredPathParam } from "@/api/core/pathParams";

export const getHamperScreen = async (campaignId) =>
  await httpClient.get(
    `/hampers/screen/${requiredPathParam(campaignId, "campaignId")}`
  );
