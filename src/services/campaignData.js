import { getAllCampaigns, getByCampaign } from "@/api/campaign.api";

import { store } from "@/store";

export const getPlatformData = async (force = false) => {
  let activeCampaignId = store.getters.getActiveCampaign;
  let activePlatformData = store.getters.getPlatformData;
  const lastUpdated = store.getters.getLastUpdated;
  const currentTime = new Date().getTime() / 1000;

  const refreshMinutes = 3;
  const refreshCampaignMinutes = 10;

  if (
    force ||
    !activeCampaignId ||
    !activePlatformData ||
    !activePlatformData?.campaignId ||
    activePlatformData?.campaignId != activeCampaignId ||
    !lastUpdated ||
    currentTime - lastUpdated >= refreshMinutes * 60
  ) {
    const allCampaigns = await getCampaigns(
      force || currentTime - lastUpdated >= refreshCampaignMinutes * 60
    );
    if (allCampaigns.length) {
      if (!activeCampaignId) {
        activeCampaignId = allCampaigns[0]?.campaignId ?? "";
        await store.commit("setActiveCampaign", activeCampaignId);
      }

      /* */
      const platformData = await getByCampaign(activeCampaignId);
      if (platformData?.data) {
        await store.dispatch("setPlatformData", {
          ...platformData.data,
          campaignId: activeCampaignId,
        });
      }
      /* */
    }
    if (force) {
      await store.commit("setForceRefresh", false);
    }
  }
};

export const getCampaigns = async (refresh = false) => {
  let allCampaigns = store.getters.getAllCampaigns;

  if (!allCampaigns.length || refresh) {
    allCampaigns = await getAllCampaigns();
    if (allCampaigns?.data) {
      let mappedCampaigns = [...allCampaigns.data];
      allCampaigns = mappedCampaigns.map((c) => ({
        campaignId: c.PK,
        name: c.campaignName,
        campaignDetails: c?.campaignDetails,
        sort: c.campaignDetails.campaignStart,
      }));
      await store.dispatch("setCampaignData", allCampaigns);
    }
  }
  return allCampaigns;
};
