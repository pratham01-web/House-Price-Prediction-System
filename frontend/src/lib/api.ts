import {
  Property,
  PropertyListResponse,
  PredictionInput,
  PredictionResponse,
  PredictionHistoryResponse,
  MarketSummary,
  PriceDistributionResponse,
  LocationMetric,
  FeatureCorrelation,
  ModelVersion,
} from "../types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `API error ${res.status}: ${errorBody || res.statusText}`
    );
  }
  return res.json();
}

export const api = {
  // Health
  getHealth: () => fetchJson<{ status: string; database_connected: boolean; active_model_version: string }>("/health"),

  // Properties
  getProperties: (params?: {
    page?: number;
    page_size?: number;
    min_price?: number;
    max_price?: number;
    bedrooms?: number;
    bathrooms?: number;
    zipcode?: string;
    waterfront?: number;
    sort_by?: string;
    sort_order?: string;
  }): Promise<PropertyListResponse> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, String(val));
        }
      });
    }
    return fetchJson<PropertyListResponse>(`/properties?${query.toString()}`);
  },

  getPropertyById: (id: number): Promise<Property> =>
    fetchJson<Property>(`/properties/${id}`),

  // Predictions
  predictPrice: (payload: PredictionInput): Promise<PredictionResponse> =>
    fetchJson<PredictionResponse>("/predictions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getPredictionHistory: (page: number = 1, page_size: number = 10): Promise<PredictionHistoryResponse> =>
    fetchJson<PredictionHistoryResponse>(`/predictions/history?page=${page}&page_size=${page_size}`),

  // Analytics
  getMarketSummary: (): Promise<MarketSummary> =>
    fetchJson<MarketSummary>("/analytics/market-summary"),

  getPriceDistribution: (): Promise<PriceDistributionResponse> =>
    fetchJson<PriceDistributionResponse>("/analytics/price-distribution"),

  getLocationBreakdown: (): Promise<{ locations: LocationMetric[] }> =>
    fetchJson<{ locations: LocationMetric[] }>("/analytics/location-breakdown"),

  getFeatureCorrelations: (): Promise<{ correlations: FeatureCorrelation[] }> =>
    fetchJson<{ correlations: FeatureCorrelation[] }>("/analytics/feature-correlations"),

  // Models
  getActiveModel: (): Promise<ModelVersion> =>
    fetchJson<ModelVersion>("/models/active"),

  listModels: (): Promise<{ models: ModelVersion[] }> =>
    fetchJson<{ models: ModelVersion[] }>("/models"),
};
