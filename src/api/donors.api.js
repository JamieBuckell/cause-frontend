import { httpClient } from "@/api/core/httpClient";
import { requiredPathParam } from "@/api/core/pathParams";

export const donorRegister = async (body) =>
  httpClient.post(`/donors/register`, body);

export const getDonorsByCampaign = async (campaignId) =>
  await httpClient.get(
    `/donors/campaign/list/${requiredPathParam(campaignId, "campaignId")}`
  );

export const verifySubscription = async (emailAddress, hash, campaignId = "") =>
  await httpClient.get(
    `/subscription/verify/${requiredPathParam(
      emailAddress,
      "emailAddress"
    )}?v=${encodeURIComponent(hash)}${
      campaignId ? "&campaignId=" + encodeURIComponent(campaignId) : ""
    }`
  );

export const confirmPledge = async (emailAddress, hash, campaignRequestId) =>
  await httpClient.get(
    `/donors/confirm-pledge/${requiredPathParam(
      emailAddress,
      "emailAddress"
    )}?v=${encodeURIComponent(hash)}&c=${encodeURIComponent(campaignRequestId)}`
  );

export const confirmPledgeManual = async (
  emailAddress,
  hash,
  campaignRequestId
) =>
  await httpClient.post(
    `/donors/confirm-pledge/${requiredPathParam(
      emailAddress,
      "emailAddress"
    )}?v=${encodeURIComponent(hash)}&c=${encodeURIComponent(campaignRequestId)}`
  );

export const getHash = async (donorId) =>
  await httpClient.post(`/donors/get-hash/`, { donorId });

export const changePledge = async (
  emailAddress,
  hash,
  changeDetail,
  campaign
) =>
  await httpClient.post(
    `/donors/change-pledge/${requiredPathParam(
      emailAddress,
      "emailAddress"
    )}?v=${encodeURIComponent(hash)}&c=${encodeURIComponent(campaign)}`,
    {
      details: changeDetail,
    }
  );

export const deleteDonor = async (body) =>
  await httpClient.post(`/donors/delete`, body);

export const hideDonor = async (body) =>
  await httpClient.post(`/donors/hide`, body);

export const deletePledge = async (body) =>
  await httpClient.post(`/donors/delete-pledge`, body);

export const resendVerification = async (body) =>
  await httpClient.post(`/donors/resend-verification`, body);

export const downloadFile = async (body) =>
  await httpClient.post(`/donors/download-file`, body);

export const donorEmailUpdate = async (body) =>
  httpClient.post(`/donors/email-update`, body);

const requireDonorSuccess = (response) => {
  if (response.status < 200 || response.status >= 300) {
    const error = new Error(Object.values(response.data?.messages || {}).join(" ") || "Could not update donor. Refresh and try again.");
    error.response = response;
    throw error;
  }
  return response;
};
export const donorPledgeUpdate = async (body) =>
  requireDonorSuccess(await httpClient.post(`/donors/update-pledge`, body));

export const reconnectDonorAllocations = async (body) =>
  requireDonorSuccess(await httpClient.post(`/donors/reconnect-allocations`, body));

export const addHamper = async (body) =>
  await httpClient.post(`/donors/update`, body);
