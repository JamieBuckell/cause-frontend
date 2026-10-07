import Swal from "sweetalert2";
import { sendEmail, previewEmail } from "@/api/communications.api";

const newRequestId = () => Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
  .map((value) => value.toString(16).padStart(2, "0")).join("");
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const labels = { donor: "Donor", nominator: "Nominator", "team-lead": "Team lead" };

// Keep the same confirmed preview after a lost HTTP response. A retry must not
// become a new mailing. sessionStorage also survives a reload in this tab.
export async function previewAndSendEmail(payload) {
  const storageKey = "cause.pendingMailing";
  const fingerprint = JSON.stringify(payload);
  let pending;
  try { pending = JSON.parse(sessionStorage.getItem(storageKey) || "null"); }
  catch (_) { pending = null; }
  if (pending && pending.fingerprint !== fingerprint) {
    if (!pending.confirmed) {
      sessionStorage.removeItem(storageKey);
      pending = null;
    } else {
      const previous = JSON.parse(pending.fingerprint);
      const decision = await Swal.fire({
        title: "Check the previous mailing first",
        text: `The result of “${previous.email.subject}” has not been confirmed. Check it before starting a different mailing.`,
        showCancelButton: true,
        confirmButtonText: "Check previous mailing",
      });
      if (decision.isConfirmed) await previewAndSendEmail(previous);
      return false;
    }
  }
  if (!pending) {
    pending = { fingerprint, requestId: newRequestId(), confirmed: false };
    sessionStorage.setItem(storageKey, JSON.stringify(pending));
  }
  // Preserve the request ID if the response is lost: the preview may exist remotely.
  const response = await previewEmail({ ...payload, action: "preview", requestId: pending.requestId });
  if (response.status !== 200) {
    if (!pending.confirmed) sessionStorage.removeItem(storageKey);
    throw new Error(response.data?.message || "Unable to preview recipients.");
  }
  const preview = response.data;
  if (preview.status === "QUEUED") {
    sessionStorage.removeItem(storageKey);
    await Swal.fire({ title: "Mailing already queued", text: "The previous confirmation succeeded. Check Sending status for its progress.", type: "success" });
    return true;
  }
  if (preview.status === "PREVIEW" && Date.now() > preview.expiresAt) {
    sessionStorage.removeItem(storageKey);
    throw new Error("This preview has expired. Preview the recipients again before sending.");
  }
  if (!preview.count || preview.invalidCount) {
    if (!pending.confirmed) sessionStorage.removeItem(storageKey);
    throw new Error(preview.invalidCount
      ? `${preview.invalidCount} recipient records have missing or invalid email addresses. Correct them before sending.`
      : "No recipients remain for this mailing.");
  }
  const rows = preview.recipients.map((r) => `<tr><td style="padding:4px;text-align:left">${escapeHtml(r.email)}</td><td style="padding:4px;text-align:left">${r.roles.map((role) => escapeHtml(labels[role] || role)).join(", ")}</td></tr>`).join("");
  const decision = await Swal.fire({
    title: `Send to ${preview.count} recipients?`,
    html: `<p>${preview.campaignId ? `Campaign: ${escapeHtml(preview.campaignId)}. ` : ""}${preview.includesPreviouslySent ? "This is an intentional resend and can include previous recipients." : `${preview.previouslySentCount} previously sent recipients excluded.`}</p><p>${preview.duplicateCount} duplicate addresses removed.</p><div style="max-height:300px;overflow:auto;font-size:13px"><table style="width:100%"><thead><tr><th>Email address</th><th>Role</th></tr></thead><tbody>${rows}</tbody></table></div><p>${pending.confirmed ? "Retrying this confirmed mailing will reuse the same send request." : "This is the exact recipient list that will be queued."}</p>`,
    showCancelButton: true,
    confirmButtonText: pending.confirmed ? "Check / retry mailing" : "Confirm and queue",
    cancelButtonText: "Cancel",
    width: 760,
  });
  if (!decision.isConfirmed) {
    if (!pending.confirmed) sessionStorage.removeItem(storageKey);
    return false;
  }
  pending.confirmed = true;
  sessionStorage.setItem(storageKey, JSON.stringify(pending));
  const sent = await sendEmail({ action: "send", requestId: pending.requestId });
  if (sent.status !== 200) throw new Error(sent.data?.message || "Unable to confirm the mailing. Retry the same request.");
  sessionStorage.removeItem(storageKey);
  await Swal.fire({ title: "Mailing queued", text: sent.data.message,
    type: "success", confirmButtonText: "OK" });
  return true;
}
