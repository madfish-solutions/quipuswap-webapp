import { BBKnownBaker } from "./types";

const API_BASE_URL = "https://api.baking-bad.org/v2";

export function getAllKnownBakers() {
  return request<BBKnownBaker[]>("/bakers" + "?type=tezos_only,multiasset,tezos_dune");
}

export function getKnownBaker(address: string) {
  return request<BBKnownBaker>(`/bakers/${address}`);
}

async function request<T = any>(path: string) {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: "GET" });

  let body;
  try {
    body = await res.json();
  } catch (_err) {}

  if (res.ok && body) {
    return body as T;
  } else if (!res.ok) {
    throw new Error(res.statusText);
  } else {
    throw new Error("Request Body hasn't been parsed");
  }
}
