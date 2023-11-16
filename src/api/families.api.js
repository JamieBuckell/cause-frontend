import { httpClient } from "@/api/core/httpClient";

export const getFamilies = async () => await httpClient.get(`/families/list`);

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
  await httpClient.post(`/hampers/check`, body);

export const recieveHamper = async (body) =>
  await httpClient.post(`/hampers/receive`, body);

export const markDirectHamper = async (body) =>
  await httpClient.post(`/hampers/mark-direct`, body);

export const getHamperOverview = async (hamperId) =>
  await httpClient.get(`/hampers/get-overview/${hamperId}`);

export const getHamperFeedbackLabels = async (body) =>
  httpClient.post(`/feedback/hampers/generate`, body);

export const getUndelivered = async () =>
  await httpClient.get(`/hampers/undelivered`);

export const getUndelivereDonors = async () =>
  await httpClient.get(`/hampers/undelivered-donors`);
