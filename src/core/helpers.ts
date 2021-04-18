import { validateAddress, ValidationResult } from "@taquito/utils";
import { Signer } from "@taquito/taquito";
import BigNumber from "bignumber.js";
import { Tezos, getContract } from "./state";
import { QSAsset } from "./types";

export async function isDexContainsLiquidity(dexAddress: string) {
  const dex = await getContract(dexAddress);
  const dexStorage = await dex.storage<any>();
  return (
    new BigNumber(dexStorage.storage.tez_pool).isZero() ||
    new BigNumber(dexStorage.storage.token_pool).isZero()
  );
}

export function toValidAmount(amount?: BigNumber) {
  return amount && amount.isFinite() && amount.isGreaterThan(0)
    ? amount.toFixed()
    : "";
}

export function isUnsafeAllowanceChangeError(err: any) {
  try {
    if (err?.message === "UnsafeAllowanceChange") {
      return true;
    }

    if (
      err?.errors?.some(
        (e: any) =>
          e?.with?.int === "23" ||
          e?.with?.string === "UnsafeAllowanceChange" ||
          e?.with?.args?.[0]?.string === "UnsafeAllowanceChange"
      )
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function toAssetSlug(asset: QSAsset) {
  return asset.type === "xtz" ? "tez" : `${asset.id}_${asset.fa2TokenId ?? 0}`;
}

export function tzToMutez(tz: any): BigNumber {
  return Tezos.format("tz", "mutez", tz) as any;
}

export function mutezToTz(mutez: any): BigNumber {
  return Tezos.format("mutez", "tz", mutez) as any;
}

export function isKTAddress(address: any): boolean {
  return isAddressValid(address) && address.startsWith("KT");
}

export function isAddressValid(address: any) {
  return validateAddress(address) === ValidationResult.VALID;
}

export function formatAddress(address: string) {
  const ln = address.length;
  return [address.slice(0, 7), "...", address.slice(ln - 4, ln)].join("");
}

export function snakeToCamelKeys(obj: any): any {
  const camelObj: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    camelObj[snakeToCamel(key)] = obj[key];
  }
  return camelObj;
}

export function snakeToCamel(str: string) {
  return str.replace(/([-_][a-z])/g, group =>
    group
      .toUpperCase()
      .replace("-", "")
      .replace("_", "")
  );
}

export class ReadOnlySigner implements Signer {
  constructor(private pkh: string, private pk: string) {}

  async publicKeyHash() {
    return this.pkh;
  }
  async publicKey() {
    return this.pk;
  }
  async secretKey(): Promise<string> {
    throw new Error("Secret key cannot be exposed");
  }
  async sign(): Promise<{
    bytes: string;
    sig: string;
    prefixSig: string;
    sbytes: string;
  }> {
    throw new Error("Cannot sign");
  }
}
