import { httpClient } from "@/api/core/httpClient";

export const getMeData = async () =>
  await httpClient.get(`/users/me`);

export const getAdminUsers = async () =>
  await httpClient.get(`/users/admin/list`);

export const createAdmin = async (body) =>
  await httpClient.post(`/users/admin/create`, body);

export const deleteUser = async (organisationId, emailAddress) =>
  await httpClient.post(`/users/delete/${organisationId}/${emailAddress}`);

export const resetUserPassword = async (emailAddress) =>
  await httpClient.post(`/users/reset-password/${emailAddress}`);

export const resetUserPasswordCommit = async (emailAddress, verificationHash) =>
  await httpClient.post(`/users/reset-password-commit/${emailAddress}/${verificationHash}`);

export const migrateUserPool = async (authData) =>
  await httpClient.post(`/user/migrate-data`, authData);

export const migrateUserPoolManual = async (authData) =>
  await httpClient.post(`/user/migrate-data-manual`, authData);

export const fixReferences = async (authData) =>
  await httpClient.post(`/users/fix-family-references`, authData);
