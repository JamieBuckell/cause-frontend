import { httpClientV2 } from "@/api/core/httpClient";

export const volunteerFeedback = async (
  body
) =>
  httpClientV2.post(`/feedback/volunteer`, body);

export const hamperFeedback = async (
  body
) =>
  httpClientV2.post(`/feedback/hamper`, body);

export const hamperFeedbackCheck = async (
  body
) =>
  httpClientV2.post(`/feedback/hampers/check`, body);

export const getHamperFeedback = async () =>
  await httpClientV2.get(`/feedback/hampers/list`);

export const getVolunteerFeedback = async () =>
  await httpClientV2.get(`/feedback/volunteers/list`);
