import { httpClient } from "@/api/core/httpClient";

export const getHamperScreen = async () =>
  await httpClient.get(`/hampers/screen`);
