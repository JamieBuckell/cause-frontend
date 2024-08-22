import { httpClient } from "@/api/core/httpClient";

export const getEmailTemplates = async () =>
  await httpClient.get(`/emails/list`);

export const updateEmailTemplate = async (body) =>
  httpClient.post(`/emails/update`, body);
