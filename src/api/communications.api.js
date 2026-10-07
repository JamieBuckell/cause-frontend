import { httpClient } from "@/api/core/httpClient";

export const previewEmail = async (body) =>
  httpClient.post(`/communications/preview`, body);

export const sendEmail = async (body) =>
  httpClient.post(`/communications/process`, body);

export const getSentCommuncations = async () =>
  await httpClient.get(`/communications/sent`);
