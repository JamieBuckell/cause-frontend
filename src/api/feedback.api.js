import { httpClient } from "@/api/core/httpClient";

export const volunteerFeedback = async (body) =>
  httpClient.post(`/feedback/volunteer`, body);

export const hamperFeedback = async (body) =>
  httpClient.post(`/feedback/hamper`, body);

export const hamperFeedbackCheck = async (body) =>
  httpClient.post(`/feedback/hampers/check`, body);

export const getHamperFeedback = async () =>
  await httpClient.get(`/feedback/hampers/list`);

export const getVolunteerFeedback = async () =>
  await httpClient.get(`/feedback/volunteers/list`);
