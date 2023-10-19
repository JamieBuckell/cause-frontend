import { httpClient } from "@/api/core/httpClient";

export const getEmailTemplates = async () =>
  await httpClient.get(`/emails/list`);
