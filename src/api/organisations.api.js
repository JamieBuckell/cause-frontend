import { httpClient, httpClientV2 } from "@/api/core/httpClient";

export const createOrganisation = async (
  body
) =>
  httpClient.post(`/organisations/create`, body);

export const deleteOrganisation = async (organisationId) =>
  await httpClient.post(`/organisations/delete/${organisationId}`);

export const getOrganisations = async () =>
  await httpClientV2.get(`/organisations/list`);

export const getOrganisationAdmins = async (requestId) =>
  await httpClient.get(`/organisations/get-admins/${requestId}`);

export const getOrganisationByHash = async (requestId, hashPassword) =>
  await httpClient.get(`/organisations/get-by-hash/${requestId}/${hashPassword}`);

export const getOrganisationByRequest = async (requestId) =>
  await httpClient.get(`/organisations/get-by-request/${requestId}`);

export const updateOrganisation = async (body) =>
  await httpClient.post(`/organisations/update`, body);

export const createOrganisationAdmin = async (requestId, body) =>
  await httpClient.post(`/organisations/create-admin/${requestId}`, body);

export const checkReference = async (reference) =>
  await httpClient.get(`/organisations/check-reference/${reference}`);
  
  