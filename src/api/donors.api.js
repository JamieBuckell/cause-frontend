import { httpClient } from "@/api/core/httpClient";

export const donorRegister = async (body) =>
  httpClient.post(`/donors/register`, body);

export const getDonorsByCampaign = async (campaignId) =>
  await httpClient.get(`/donors/campaign/list/${campaignId}`);

export const verifySubscription = async (emailAddress, hash, campaignId = "") =>
  await httpClient.get(
    `/subscription/verify/${emailAddress}?v=${hash}${
      campaignId ? "&campaignId=" + campaignId : ""
    }`
  );

export const confirmPledge = async (emailAddress, hash, campaignRequestId) =>
  await httpClient.get(
    `/donor/confirm-pledge/${emailAddress}?v=${hash}&c=${campaignRequestId}`
  );

export const confirmPledgeManual = async (emailAddress, hash) =>
  await httpClient.post(`/donor/confirm-pledge/${emailAddress}?v=${hash}`);

export const changePledge = async (emailAddress, hash, changeDetail) =>
  await httpClient.post(`/donor/change-pledge/${emailAddress}?v=${hash}`, {
    details: changeDetail,
  });

export const getDonorById = async (donorId) =>
  await httpClient.get(`/donor/view/${donorId}`);

export const deleteDonor = async (body) =>
  await httpClient.post(`/donors/delete`, body);

export const deletePledge = async (body) =>
  await httpClient.post(`/donor/delete-pledge`, body);

export const resendVerification = async (body) =>
  await httpClient.post(`/donors/resend-verification`, body);

export const downloadFile = async (body) =>
  await httpClient.post(`/donors/download-file`, body);

export const donorEmailUpdate = async (body) =>
  httpClient.post(`/donors/email-update`, body);

export const donorPledgeUpdate = async (body) =>
  httpClient.post(`/donors/update-pledge`, body);
