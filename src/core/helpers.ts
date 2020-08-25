import { Tezos } from "@taquito/taquito";
import { validateAddress, ValidationResult } from "@taquito/utils";
import BigNumber from "bignumber.js";

export function toValidAmount(amount?: BigNumber) {
  return amount && amount.isFinite() && amount.isGreaterThan(0)
    ? amount.toString()
    : "";
}

export function tzToMutez(tz: any) {
  return Tezos.format("tz", "mutez", tz) as BigNumber;
}

export function mutezToTz(mutez: any) {
  return Tezos.format("mutez", "tz", mutez) as BigNumber;
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
