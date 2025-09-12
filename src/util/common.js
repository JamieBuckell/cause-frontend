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
