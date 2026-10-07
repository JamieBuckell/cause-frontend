import Swal from "sweetalert2";
import { reconnectDonorAllocations } from "@/api/donors.api";
export const editablePledges = (requests, edit, index, remove = false) => {
  const next = JSON.parse(JSON.stringify(requests));
  if (remove) next.splice(index, 1);
  else next[index] = JSON.parse(JSON.stringify(edit));
  // The backend owns allocation links; forms submit pledge preferences only.
  return next.map(({ requestId, numberOfFamilies, familyDetail, additionalInfo }) => ({ requestId, numberOfFamilies, familyDetail, additionalInfo }));
};
export async function reconnectAssignments(donor, campaignId) {
  let targetRequestId;
  const requests = donor.familyDetails?.request || [];
  if (requests.length > 1) {
    const choice = await Swal.fire({ title: "Choose a pledge", text: "Choose the pledge to receive any missing allocation links.",
      input: "select", inputOptions: Object.fromEntries(requests.map((r, i) => [r.requestId, `Pledge ${i + 1} · ${r.numberOfFamilies} families`])),
      showCancelButton: true, confirmButtonText: "Preview" });
    if (!choice.isConfirmed) return null;
    targetRequestId = choice.value;
  }
  const input = { donorId: donor.GSI2PK, campaignId, ...(targetRequestId ? { targetRequestId } : {}) };
  const { data } = await reconnectDonorAllocations({ ...input, action: "preview" });
  if (!data.references.length) {
    await Swal.fire({ title: "Allocations already linked", text: "No missing links were found.", icon: "info" });
    return null;
  }
  const decision = await Swal.fire({ title: "Reconnect allocation links?", icon: "question",
    text: `Reconnect ${data.references.join(", ")} to this donor's pledge. These families are already assigned to this donor. No email will be sent.`,
    showCancelButton: true, confirmButtonText: "Reconnect" });
  if (!decision.isConfirmed) return null;
  return (await reconnectDonorAllocations({ ...input, action: "repair", targetRequestId: data.targetRequestId, fingerprint: data.fingerprint })).data;
}
