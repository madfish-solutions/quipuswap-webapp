import { validateAddress, ValidationResult } from "@taquito/utils";
import { Signer } from "@taquito/taquito";
import BigNumber from "bignumber.js";
import { Tezos } from "./state";

export function toValidAmount(amount?: BigNumber) {
  return amount && amount.isFinite() && amount.isGreaterThan(0)
    ? amount.toFixed()
    : "";
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
