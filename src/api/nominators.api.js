import { httpClient } from "@/api/core/httpClient";
import { requiredPathParam } from "@/api/core/pathParams";

export const nominatorRegister = async (body) =>
  httpClient.post(`/nominators/register`, body);

export const getNominators = async (organisationId) =>
  await httpClient.get(
    `/nominators/list${
      organisationId
        ? "/" + requiredPathParam(organisationId, "organisationId")
        : ""
    }`
  );

export const getNominatorByRequest = async (requestId) =>
  await httpClient.get(
    `/nominators/get-by-request/${requiredPathParam(requestId, "requestId")}`
  );

export const updateNominator = async (body) =>
  await httpClient.post(`/nominators/update`, body);

export const sendNominatorAdminEmail = async (adminId) =>
  await httpClient.post(
    `/nominators/email-admin/${requiredPathParam(adminId, "adminId")}`
  );

export const approveNominator = async (nominatorId, organisationId) =>
  await httpClient.post(
    `/nominators/approve/${requiredPathParam(
      nominatorId,
      "nominatorId"
    )}/${requiredPathParam(organisationId, "organisationId")}`
  );

export const resetNominatorPassword = async (nominatorId) =>
  await httpClient.post(
    `/nominators/reset-password/${requiredPathParam(
      nominatorId,
      "nominatorId"
    )}`
  );

export const deleteNominator = async (nominatorId) =>
  await httpClient.post(
    `/nominators/delete/${requiredPathParam(nominatorId, "nominatorId")}`
  );

export const createNominator = async (body) =>
  await httpClient.post(`/nominators/create`, body);

export const sendWelcomeEmail = async (userId) =>
  await httpClient.post(
    `/nominators/send-welcome/${requiredPathParam(userId, "userId")}`
  );
