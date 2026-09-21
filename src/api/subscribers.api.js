import { httpClient } from "@/api/core/httpClient";
import { requiredPathParam } from "@/api/core/pathParams";

export const createSubscriber = async (body) =>
  httpClient.post(`/subscription/create`, body);

export const getSubscribers = async () =>
  await httpClient.get(`/subscription/list`);

export const deleteSubscriber = async (subscriberId) =>
  httpClient.post(
    `/subscription/delete/${requiredPathParam(subscriberId, "subscriberId")}`
  );

export const checkSubscriber = async (email, hash) =>
  await httpClient.get(
    `/subscription/check/${requiredPathParam(
      email,
      "email"
    )}/${requiredPathParam(hash, "hash")}`
  );

export const Unsubscribe = async (email, hash) =>
  await httpClient.get(
    `/subscription/unsubscribe/${requiredPathParam(
      email,
      "email"
    )}/${requiredPathParam(hash, "hash")}`
  );

export const Resubscribe = async (email, hash) =>
  await httpClient.get(
    `/subscription/resubscribe/${requiredPathParam(
      email,
      "email"
    )}/${requiredPathParam(hash, "hash")}`
  );
