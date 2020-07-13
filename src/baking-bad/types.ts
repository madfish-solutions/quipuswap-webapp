export interface BBKnownBaker {
  address: string;
  name: string;
  logo: string;
  balance: number;
  stakingBalance: number;
  stakingCapacity: number;
  maxStakingBalance: number;
  freeSpace: number;
  fee: number;
  minDelegation: number;
  payoutDelay: number;
  payoutPeriod: number;
  openForDelegation: boolean;
  estimatedRoi: number;
  serviceType: BBServiceType;
  serviceHealth: BBServiceHealth;
  payoutTiming: BBPayoutTiming;
  payoutAccuracy: BBPayoutAccuracy;
  audit: string;
  insuranceCoverage: number;
  config: any;
  insurance: any;
  contribution: any;
}

export type BBServiceType = "tezos_only" | "multiasset" | "exchange" | "tezos_dune";

export type BBServiceHealth = "active" | "closed" | "dead";

export type BBPayoutTiming = "stable" | "unstable" | "suspicious" | "no_data";

export type BBPayoutAccuracy = "precise" | "inaccurate" | "suspicious" | "no_data";
