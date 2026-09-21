import { httpClient } from "@/api/core/httpClient";
import { requiredPathParam } from "@/api/core/pathParams";

export const volunteerFeedback = async (body) =>
  httpClient.post(`/feedback/volunteer`, body);

export const hamperFeedback = async (body) =>
  httpClient.post(`/feedback/hamper`, body);

export const hamperFeedbackCheck = async (body) =>
  httpClient.post(`/feedback/hampers/check`, body);

export const getHamperFeedback = async (campaignId) =>
  await httpClient.get(
    `/feedback/hampers/list/${requiredPathParam(campaignId, "campaignId")}`
  );

export const getVolunteerFeedback = async (campaignId) =>
  await httpClient.get(
    `/feedback/volunteers/list/${requiredPathParam(campaignId, "campaignId")}`
  );
