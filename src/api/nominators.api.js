import { httpClient } from "@/api/core/httpClient";

export const nominatorRegister = async (
  body
) =>
  httpClient.post(`/nominators-register`, body);

export const getNominators = async (organisationId) =>
  await httpClient.get(`/nominators/list${organisationId ? '/' +organisationId : ''}`);

export const getNominatorByRequest = async (requestId) =>
  await httpClient.get(`/nominators/get-by-request/${requestId}`);

export const updateNominator = async (body) =>
  await httpClient.post(`/nominators/update`, body);

export const sendNominatorAdminEmail = async (adminId) =>
  await httpClient.post(`/nominators/email-admin/${adminId}`);

export const approveNominator = async (nominatorId, organisationId) =>
  await httpClient.post(`/nominators/approve/${nominatorId}/${organisationId}`);

export const resetNominatorPassword = async (nominatorId) =>
  await httpClient.post(`/nominators/reset-password/${nominatorId}`);
  