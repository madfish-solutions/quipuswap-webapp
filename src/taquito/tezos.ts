import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import { validateAddress, ValidationResult } from "@taquito/utils";
import { ThanosWallet, ThanosDAppNetwork } from "@thanos-wallet/dapp";

const tezos = new TezosToolkit();
export const NETWORKS = {
  mainnet: "Tezos Mainnet",
  carthagenet: "Carthage Testnet",
};
export default async function initContract(contractAddress: string) {
  try {
    const signer = await InMemorySigner.fromSecretKey(
      "edskRvJ57F7SM8yJi96rASgBSeLd6a8DCkqQg9p4WyMtMSR5skd9jPWRfHaY3jwjc8yHYRKbmKpj4t7KwGUyH6cK6quLrXqS6K"
    );
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
  const storage = await contract.storage<any>().then(s => s.storage);
  return storage;
}

export async function getTezosBalance(pkh: string) {
  const balance: any = await tezos.tz.getBalance(pkh);
  return balance;
}

export async function getTokenStorage(contractAddress: string) {
  const contract = await initContract(contractAddress);
  const storage = await contract.storage<any>();
  return storage;
}

export async function getTokenBalance(contractAddress: string, pkh: string) {
  const storage = await getTokenStorage(contractAddress);
  const val = await storage.ledger.get(pkh);
  return val ? Number(val.balance) : 0;
}

export async function isCorrectAddress(address: string) {
  const isAddress = await validateAddress(address);
  return isAddress === ValidationResult.VALID;
}

export function isAddressValid(address: any) {
  return validateAddress(address) === ValidationResult.VALID;
}

export async function useThanosWallet(forcePermission: boolean = false) {
  const wallet = new ThanosWallet("Quipuswap");
  const network: ThanosDAppNetwork =
    (localStorage.getItem("network") as ThanosDAppNetwork) || "mainnet";
  await wallet.connect(network, { forcePermission });
  const thanosWallet = wallet.toTezos();
  return thanosWallet;
}
