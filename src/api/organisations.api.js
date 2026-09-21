import { httpClient } from "@/api/core/httpClient";
import { requiredPathParam } from "@/api/core/pathParams";

export const createOrganisation = async (body) =>
  httpClient.post(`/organisations/create`, body);

export const deleteOrganisation = async (organisationId, campaignId) =>
  await httpClient.post(
    `/organisations/delete/${requiredPathParam(
      organisationId,
      "organisationId"
    )}`,
    { campaignId }
  );

export const getOrganisations = async () =>
  await httpClient.get(`/organisations/list`);

export const getOrganisationAdmins = async (requestId) =>
  await httpClient.get(
    `/organisations/get-admins/${requiredPathParam(requestId, "requestId")}`
  );

export const getOrganisationByHash = async (requestId, hashPassword) =>
  await httpClient.get(
    `/organisations/get-by-hash/${requiredPathParam(
      requestId,
      "requestId"
    )}/${requiredPathParam(hashPassword, "hashPassword")}`
  );

export const getOrganisationByRequest = async (requestId) =>
  await httpClient.get(
    `/organisations/get-by-request/${requiredPathParam(requestId, "requestId")}`
  );

export const updateOrganisation = async (body) =>
  await httpClient.post(`/organisations/update`, body);

export const createOrganisationAdmin = async (requestId, body) =>
  await httpClient.post(
    `/organisations/create-admin/${requiredPathParam(requestId, "requestId")}`,
    body
  );

export const checkReference = async (reference, campaignId) =>
  await httpClient.post(
    `/organisations/check-reference/${requiredPathParam(
      reference,
      "reference"
    )}`,
    { campaignId }
  );
