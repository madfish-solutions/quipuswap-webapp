import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";

const tezos = new TezosToolkit();

// const secretKey =
//   "edskSA3LPykPsXyVR9kyqMv5p8Zbx5B64eRgdW8MQwSsJWaxzMdrkr8KCv1oPcmBtdQ1iqosu9V9sWeS1PftcaE6r3GvYfPYRK" ||
//   "edskRtmEwZxRzwd1obV9pJzAoLoxXFWTSHbgqpDBRHx1Ktzo5yVuJ37e2R4nzjLnNbxFU4UiBU1iHzAy52pK5YBRpaFwLbByca";

// Deployed at: KT1TmQSJ3T8LhCS1Dg6UoYqBUsUNqyXdUmuw
// Deployed at: KT1FkfDFAQVV26r4UwD8NWptLDMZ5LBghMsr
// Deployed at: KT1E5Wx8FNN6uYSw3DgLt1XnfgmnQLNcUWPn
// Deployed at: KT19u1VcyWDFFipWF8QGxT3rBWgBUyXeKT5f
// Deployed at: KT1NeHcnQDCxFM85tzLLTLnA22w9wPCxhNhU

// const tkey = {
//   mnemonic: [
//     "wide",
//     "bike",
//     "census",
//     "razor",
//     "fatal",
//     "forward",
//     "unfair",
//     "arrow",
//     "senior",
//     "when",
//     "regret",
//     "eyebrow",
//     "keep",
//     "stem",
//     "glove",
//   ],
//   secret: "0afa4f0ccfda37d224c7b991f05ad788d85416cc",
//   amount: "54948754334",
//   pkh: "tz1bQEJqMqC92ommfsRB6pWG9LVBKNgXPysh",
//   password: "wDpLCUH2vZ",
//   email: "ertvhgnc.mdbtqlze@tezos.example.org",
// };

export default async function initContract(contractAddress: string) {
  try {
    const signer = await InMemorySigner.fromSecretKey(
      // secretKey
      "edskRvJ57F7SM8yJi96rASgBSeLd6a8DCkqQg9p4WyMtMSR5skd9jPWRfHaY3jwjc8yHYRKbmKpj4t7KwGUyH6cK6quLrXqS6K"
    );
    // await tezos.importKey(tkey.email, tkey.password, tkey.mnemonic.join(" "), tkey.secret);
    console.log(await signer.publicKeyHash(), "a");
    await tezos.setProvider({
      rpc: "https://api.tez.ie/rpc/carthagenet",
      signer,
    });
  } catch (e) {
    console.log(e, "init exception");
  }
  const contract = await tezos.contract.at(contractAddress);
  return contract;
}

export async function getStorage(contractAddress: string) {
  const contract = await initContract(contractAddress);
  const storage = await contract.storage<any>();
  return storage;
}
