import { httpClient } from "@/api/core/httpClient";
import { requiredPathParam } from "@/api/core/pathParams";

export const getDropOffsReport = async (campaignId, day) =>
  await httpClient.get(
    `/reports/drop-offs/${requiredPathParam(
      campaignId,
      "campaignId"
    )}/${requiredPathParam(day, "day")}`
  );

export const getAllDropOffsReport = async (campaignId) =>
  await httpClient.get(
    `/reports/all-drop-offs/${requiredPathParam(campaignId, "campaignId")}`
  );
