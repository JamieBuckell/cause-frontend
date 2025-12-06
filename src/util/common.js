export const ageListBase = [
  { label: "0-6 months", value: 0.25 },
  { label: "6-12 months", value: 0.75 },
  { label: "12-18 months", value: 1 },
  { label: "18-24 months", value: 1.5 },
];

export const createFamilyDetail = (members) => {
  var rtnString = "";
  if (members) {
    for (const [key, m] of Object.entries(members)) {
      const ageListIndex = ageListBase.findIndex((al) => al.value == m.age);
      rtnString += `
                    <div class="row">
                        <div class="col-12">
                            <strong>
                            ${m.who}${m.whoOther ? " (" + m.whoOther + ")" : ""}
                            </strong>
                             ${
                               ageListIndex >= 0
                                 ? ageListBase[ageListIndex].label
                                 : m.age + " " + (m.age ? m.ageType : "")
                             }
                            ${
                              m.additionalInfo
                                ? "<br />Info: " + m.additionalInfo
                                : ""
                            }
                        </div>
                    </div>
                    `;
    }
    /* */
  }
  return rtnString;
};

export const createFamilyDetailBasic = (members) => {
  if (!members) return "";

  const parts = [];

  for (const [, m] of Object.entries(members)) {
    if (!m) continue;

    // Base name: "Dad" or "Mam (Gran)" etc.
    const who = m.whoOther ? `${m.who} (${m.whoOther})` : m.who || "";

    // Look up age label if present in ageListBase
    const ageItem = ageListBase.find((al) => al.value == m.age);

    let ageLabel = "";
    if (ageItem) {
      // e.g. "46 Years" or "Adult"
      ageLabel = ageItem.label;
    } else if (m.age) {
      // Fallback: "46 Years" built from raw data
      ageLabel = `${m.age} ${m.ageType || ""}`.trim();
    }

    // Build "Mam 46 Years" or just "Dad" if no age
    const piece = ageLabel ? `${who} ${ageLabel}`.trim() : who.trim();

    if (piece) {
      parts.push(piece);
    }
  }

  // "Dad, Mam 46 Years" / "Mam, Boy 4 Years, Boy 6 Years"
  return parts.join(", ");
};
