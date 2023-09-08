import { httpClient } from "@/api/core/httpClient";

export const createSubscriber = async (body) =>
  httpClient.post(`/subscriber/create`, body);

export const getSubscribers = async () =>
  await httpClient.get(`/subscription/list`);

export const deleteSubscriber = async (subscriberId) =>
  httpClient.post(`/subscriber/delete/${subscriberId}`);
