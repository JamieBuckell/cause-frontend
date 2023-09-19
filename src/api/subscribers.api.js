import { httpClient } from "@/api/core/httpClient";

export const createSubscriber = async (body) =>
  httpClient.post(`/subscriber/create`, body);

export const getSubscribers = async () =>
  await httpClient.get(`/subscription/list`);

export const deleteSubscriber = async (subscriberId) =>
  httpClient.post(`/subscriber/delete/${subscriberId}`);

export const checkSubscriber = async (email, hash) =>
  await httpClient.get(`/subscription/check/${email}/${hash}`);

export const Unsubscribe = async (email, hash) =>
  await httpClient.get(`/subscription/unsubscribe/${email}/${hash}`);

export const Resubscribe = async (email, hash) =>
  await httpClient.get(`/subscription/resubscribe/${email}/${hash}`);
