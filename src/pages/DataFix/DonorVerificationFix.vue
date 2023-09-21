<template>
  <div class="row donors-list">
    <div class="col-12">
      <p v-if="!output">Loading</p>
      <p v-else v-html="output"></p>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-console */
import Vue from "vue";
let crypto = require("crypto");

window.EventBus = new Vue({
  methods: {
    emit(payload) {
      this.$emit("$EventBusEvent", payload);
    },
  },
});

export default {
  components: {},
  props: {},
  data() {
    return {
      output: "",
    };
  },
  computed: {
    platformData() {
      return this.$store.getters.getPlatformData;
    },
  },
  methods: {
    hash(password, salt) {
      if (password == null || salt == null) {
        throw new Error("Must Provide Password and salt values");
      }
      if (typeof password !== "string" || typeof salt !== "string") {
        throw new Error(
          "password must be a string and salt must either be a salt string or a number of rounds"
        );
      }
      return this.hasher(password, salt);
    },
    hasher(password, salt) {
      let hash = crypto.createHmac("sha256", salt);
      hash.update(password);
      let value = hash.digest("hex");
      return {
        salt: salt,
        hashedpassword: value,
      };
    },
  },
  async mounted() {
    if (!this.isJamie()) {
      this.$router.push("/");
    }

    const donorUpdates = [
      "email+normal@jamiebuckell.co.uk",
      "marymdenham@gmail.com",
      "cmstockton@hotmail.com",
      "marymdenham@gmail.com",
      "liam.really.is@gmail.com",
      "danwestall@live.co.uk",
      "emma.l.dauncey@gmail.com",
      "nataliebailey88@gmail.com",
      "danielj_mcwilliams@hotmail.com",
      "ashley_kaye7@yahoo.co.uk",
      "joanna_gamesby@hotmail.com",
      "abbelliott@icloud.com",
      "allisonholding1967@gmail.com",
      "donna-sophie@hotmail.com",
      "teresamcandrew2k@hotmail.com",
      "donna-sophie@hotmail.com",
      "helenpickard100@gmail.com",
      "raif_family@btinternet.com",
      "kwake3@hotmail.com",
      "joanne.gunn@hotmail.com",
      "melanie155@hotmail.com",
      "mrsmahoney3@hotmail.co.uk",
      "marymdenham@gmail.com",
      "claire.cocks@live.co.uk",
      "mary.parvin@ntlworld.com",
      "se.smiles2@virginmedia.com",
      "jordanxmartin@hotmail.co.uk",
      "mcnallysarah@hotmail.com",
      "lilybrothwood@hotmail.com",
      "sharon.jmcintyre@googlemail.com",
      "alipost49@gmail.com",
      "heleneglinton@sky.com",
      "louise.longstaff1977@gmail.com",
      "cajlewis@googlemail.com",
      "hannahdaltry@hotmail.com",
      "eveharrison1990@outlook.com",
      "hannahdaltry@hotmail.com",
      "steel.vicky@yahoo.co.uk",
      "y.gall@nhs.net",
      "mandy.s@teessidecharity.org.uk",
      "helen_l_larkin@hotmail.com",
      "caragoodchild12@gmail.com",
      "kirsty_heel@hotmail.co.uk",
      "tyoung509@hotmail.com",
      "sheila.argument@hotmail.co.uk",
      "aimeemc@gmail.com",
      "thomasandrobert@googlemail.com",
      "sheila.argument@hotmail.co.uk",
      "boneill999@icloud.com",
      "jenniehuckins@hotmail.com",
      "sarah.richardson@stockton.ac.uk",
      "claire_gibson@hotmail.co.uk",
      "l.masterman@hotmail.com",
      "katiej01@live.co.uk",
      "klofts@activefp.co.uk",
      "vwamy@hotmail.com",
      "sophieoj1@gmail.com",
      "lynnduncan145@gmail.com",
      "david.black@pips.support",
      "karenhowes66@sky.com",
      "jossharbron@hotmail.com",
      "catherine.mcglone@hotmail.co.uk",
      "longworthb@hotmail.co.uk",
      "wilsonlouise85@gmail.com",
      "danielleredshaw27@hotmail.com",
      "bethanyquinn1994@hotmail.co.uk",
      "donrowey@outlook.com",
      "amandanagy86@hotmail.com",
      "wendymills68@hotmail.com",
    ];

    for (const email of donorUpdates) {
      const pData = this.platformData;
      const nominatorIndex = pData.donors.findIndex((d) => d?.GSI3PK === email);
      if (nominatorIndex) {
        const nominator = pData.donors[nominatorIndex];
        if (nominator?.emailVerification) {
          if (nominator.emailVerification?.verified) {
            console.log("Already verified, Skipping", email);
            continue;
          }

          const donorHash = this.hash(
            nominator.emailVerification.hash.replace("H#", ""),
            "46d6a84b07ce2e"
          ).hashedpassword;
          nominator.emailVerification.verified;
          pData.donors[nominatorIndex];
          const apiURL =
            process.env.NODE_ENV === "production"
              ? "https://portal.cause-foundation.org.uk/"
              : "http://localhost:4000/";

          console.log(
            `${apiURL}subscription/verify/${encodeURI(
              email
            )}?v=${donorHash}&c=CH2`
          );
        }
      }
    }

    let errors = 0;

    this.output += `<br />Total Errors: ${errors}`;
  },
};
/* eslint-enable no-console */
</script>
<style lang="scss">
.donors-list {
  .donorName,
  .donorEmail,
  .donorTelephone,
  .donorCompany,
  .donorAdditional {
    display: block;
  }

  .donorAdditional {
    padding-top: 10px;
  }
}
</style>
