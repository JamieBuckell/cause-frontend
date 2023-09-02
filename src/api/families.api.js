import { httpClient } from "@/api/core/httpClient";
import { httpClientV2 } from "@/api/core/httpClient";  

export const getFamilies = async () =>
  await httpClient.get(`/families/list`);

export const getFamilyByRequest = async (requestId) =>
  await httpClient.get(`/families/get-by-request/${requestId}`);

export const getFamilyByOrganisation = async (organisationId) =>
  await httpClient.get(`/families/organisation/${organisationId}`);

export const updateFamily = async (body) =>
  await httpClient.post(`/families/update`, body);

export const createFamily = async (body) =>
  await httpClient.post(`/families/create`, body);

export const splitFamily = async (body) =>
  await httpClient.post(`/families/split`, body);
  
export const deleteFamily = async (familyId) =>
  await httpClient.post(`/families/delete/${familyId}`);

export const allocateFamily = async (body) =>
  await httpClient.post(`/families/allocate`, body);

export const unallocateFamily = async (body) =>
  await httpClient.post(`/families/allocate/remove`, body);

export const emailFamilyAssignment = async (body) =>
  await httpClient.post(`/families/email-assignment`, body);

export const checkHamper = async (body) =>
  await httpClientV2.post(`/hampers/check`, body);

export const recieveHamper = async (body) =>
  await httpClientV2.post(`/hampers/receive`, body);

export const markDirectHamper = async (body) =>
  await httpClientV2.post(`/hampers/mark-direct`, body);

export const getHamperOverview = async (hamperId) =>
  await httpClientV2.get(`/hampers/get-overview/${hamperId}`);

export const getHamperFeedbackLabels = async (
  body
) =>
  httpClientV2.post(`/hampers/feedback/generate`, body);

export const getUndelivered = async () =>
  await httpClientV2.get(`/hampers/undelivered`);

export const getUndelivereDonors = async () =>
  await httpClientV2.get(`/hampers/undelivered-donors`);

  