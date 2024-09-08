const poolData = {
  UserPoolId:
    process.env.NODE_ENV === "production"
      ? "eu-west-2_AwNh0tGjz"
      : "eu-west-2_Ayj8Ot6cv",
  UserPoolIdV2:
    process.env.NODE_ENV === "production"
      ? "eu-west-2_ueeqpE5iq"
      : "eu-west-2_Tq53Gr5Pd",
  ClientId:
    process.env.NODE_ENV === "production"
      ? "5pq94g5sh3ipf8h16vu8s89khr"
      : "3v8vbsa7r4kirfjhm8fdgj2p4u",
  // ClientId: "4su0qinnjgl6sdrm46boq46pec",
  ClientIdV2:
    process.env.NODE_ENV === "production"
      ? "70c1ntp9kavtek871r8cv5dquj"
      : "36m9t26ec0gj2jh2ifq3h6qsip",
  Endpoint: "https//auth.cause-foundation.org.uk/",
};

const portalDefaults = {
  campaign: "CH24",
};

export default { poolData, portalDefaults };
