import { httpClient } from "@/api/core/httpClient";

export const createSubscriber = async (
  body
) =>
  httpClient.post(`/subscriber/create`, body);

export const deleteSubscriber = async (
  subscriberId
) =>
  httpClient.post(`/subscriber/delete/${subscriberId}`);

  
