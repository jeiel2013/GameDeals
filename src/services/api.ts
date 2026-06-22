import { Deal, DealDetail, Store } from '../types';

const BASE_URL = 'https://www.cheapshark.com/api/1.0';

export async function fetchDeals(params?: {
  storeID?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  onSale?: boolean;
  title?: string;
  lowerPrice?: number;
  upperPrice?: number;
}): Promise<Deal[]> {
  const query = new URLSearchParams({
    pageSize: String(params?.pageSize ?? 25),
    pageNumber: String(params?.pageNumber ?? 0),
    sortBy: params?.sortBy ?? 'DealRating',
    onSale: params?.onSale !== undefined ? String(Number(params.onSale)) : '1',
  });

  if (params?.storeID) query.set('storeID', params.storeID);
  if (params?.title) query.set('title', params.title);
  if (params?.lowerPrice !== undefined) query.set('lowerPrice', String(params.lowerPrice));
  if (params?.upperPrice !== undefined) query.set('upperPrice', String(params.upperPrice));

  const response = await fetch(`${BASE_URL}/deals?${query}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export async function fetchDealDetail(dealID: string): Promise<DealDetail> {
  const response = await fetch(`${BASE_URL}/deals?id=${dealID}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export async function fetchStores(): Promise<Store[]> {
  const response = await fetch(`${BASE_URL}/stores`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export function getStoreLogoUrl(storeID: string): string {
  return `https://www.cheapshark.com/img/stores/icons/${Number(storeID) - 1}.png`;
}

export function formatSavings(savings: string): string {
  return `${Math.round(parseFloat(savings))}% off`;
}

export function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (num === 0) return 'Free';
  return `$${num.toFixed(2)}`;
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return 'Unknown';
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export interface Game {
  gameID: string;
  steamAppID: string | null;
  cheapest: string;
  cheapestDealID: string;
  external: string;
  internalName: string;
  thumb: string;
}

export async function fetchGames(params: {
  title: string;
  limit?: number;
  exact?: boolean;
}): Promise<Game[]> {
  const query = new URLSearchParams({
    title: params.title,
    limit: String(params.limit ?? 30),
    exact: params.exact ? '1' : '0',
  });
  const response = await fetch(`https://www.cheapshark.com/api/1.0/games?${query}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
