import { getAllCampaigns, getByCampaign } from "@/api/campaign.api";

import { store } from "@/store";

export const getPlatformData = async () => {
  let activeCampaignId = store.getters.getActiveCampaign;
  let activePlatformData = store.getters.getPlatformData;
  const lastUpdated = store.getters.getLastUpdated;
  const currentTime = new Date().getTime() / 1000;

  if (
    !activeCampaignId ||
    !activePlatformData ||
    !activePlatformData?.campaignId ||
    activePlatformData?.campaignId != activeCampaignId ||
    !lastUpdated ||
    currentTime - lastUpdated >= 300
  ) {
    const allCampaigns = await getCampaigns();
    if (allCampaigns.length) {
      if (!activeCampaignId) {
        activeCampaignId = allCampaigns[0]?.campaignId ?? "";
        await store.commit("setActiveCampaign", activeCampaignId);
      }

      const platformData = await getByCampaign(activeCampaignId);
      if (platformData?.data) {
        await store.dispatch("setPlatformData", {
          ...platformData.data,
          campaignId: activeCampaignId,
        });
      }
    }
  }
};

export const getCampaigns = async () => {
  let allCampaigns = store.getters.getAllCampaigns;
  if (!allCampaigns.length) {
    allCampaigns = await getAllCampaigns();
    if (allCampaigns?.data) {
      await store.dispatch(
        "setCampaignData",
        allCampaigns.data.map((c) => ({
          campaignId: c.PK,
          name: c.campaignName,
          sort: c.campaignDetails.campaignStart,
        }))
      );
    }
  }
  return allCampaigns;
};
