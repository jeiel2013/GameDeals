export interface Deal {
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale: string;
  savings: string;
  metacriticScore: string;
  steamRatingText: string;
  steamRatingPercent: string;
  steamRatingCount: string;
  dealRating: string;
  title: string;
  internalName: string;
  thumb: string;
  lastChange: number;
  releaseDate: number;
  storeID_str?: string;
}

export interface DealDetail extends Deal {
  gameInfo?: {
    storeID: string;
    gameID: string;
    name: string;
    steamAppID: string | null;
    salePrice: string;
    retailPrice: string;
    steamRatingText: string;
    steamRatingPercent: string;
    steamRatingCount: string;
    metacriticScore: string;
    metacriticLink: string | null;
    reviewScore: number;
    reviewScoreDesc: string;
    thumb: string;
  };
  cheaperStores?: Array<{
    dealID: string;
    storeID: string;
    salePrice: string;
    retailPrice: string;
  }>;
  cheapestPrice?: {
    price: string;
    date: number;
  };
}

export interface SavedDeal {
  id: number;
  dealID: string;
  title: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  thumb: string;
  savedAt: string;
}

export interface Store {
  storeID: string;
  storeName: string;
  isActive: number;
  images: {
    banner: string;
    logo: string;
    icon: string;
  };
}
