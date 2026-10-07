import { httpClient } from "@/api/core/httpClient";

export const previewEmail = async (body) =>
  httpClient.post(`/communications/preview`, body);

export const sendEmail = async (body) =>
  httpClient.post(`/communications/process`, body);

export const getSentCommuncations = async () =>
  await httpClient.get(`/communications/sent`);

// The shared client resolves some HTTP failures; reject them here so reviews
// cannot look saved when the server reported a conflict or validation error.
const requireSuccess = (response) => {
  if (response.status < 200 || response.status >= 300) {
    const error = new Error(response.data?.message || "Email issue request failed.");
    error.response = response;
    throw error;
  }
  return response;
};
export const getEmailIssues = async (params) => requireSuccess(await httpClient.get(`/communications/issues`, { params }));
export const reviewEmailIssue = async (body) => requireSuccess(await httpClient.post(`/communications/issues/review`, body));
