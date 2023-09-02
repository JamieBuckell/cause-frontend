import { httpClient } from "@/api/core/httpClient";

export const sendEmail = async (
  body
) =>
  httpClient.post(`/communications/process-email`, body);

export const getSentCommuncations = async () =>
  await httpClient.get(`/communications/sent`);

