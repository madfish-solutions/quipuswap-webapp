import { TNBakerPreview, TNBaker } from "./types";

const API_BASE_URL = "https://api.tezos-nodes.com/v1";

export async function getAllBakers() {
  const bakers = await request<TNBakerPreview[]>("/bakers");
  return bakers.filter(isBakerPay).map(fixBakerLogo);
}

export async function getBaker(address: string) {
  const baker = await request<TNBaker>(`/baker/${address}`);
  if (!isBakerPay(baker)) return null;
  return fixBakerLogo(baker);
}

function fixBakerLogo<T extends TNBaker | TNBakerPreview>(baker: T) {
  return baker.logo.includes("/storage")
    ? baker
    : { ...baker, logo: baker.logo.replace("/images", "/storage/images") };
}

function isBakerPay<T extends TNBaker | TNBakerPreview>(baker: T) {
  return baker.deletation_status;
}

async function request<T = any>(path: string) {
  const res = await fetch(`${API_BASE_URL}${path}`);

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
