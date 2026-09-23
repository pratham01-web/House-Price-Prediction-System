export interface Property {
  id: number;
  external_id: string;
  dataset_version_id: string;
  price: number;
  sale_date?: string;
  bedrooms: number;
  bathrooms: number;
  sqft_living: number;
  sqft_lot: number;
  floors: number;
  waterfront: number;
  view_score: number;
  condition_score: number;
  grade_score: number;
  sqft_above: number;
  sqft_basement: number;
  yr_built: number;
  yr_renovated: number;
  zipcode: string;
  latitude: number;
  longitude: number;
  sqft_living15?: number;
  sqft_lot15?: number;
  created_at: string;
}

export interface PropertyListResponse {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: Property[];
}

export interface PredictionInput {
  bedrooms: number;
  bathrooms: number;
  sqft_living: number;
  sqft_lot: number;
  floors: number;
  waterfront: number;
  view_score: number;
  condition_score: number;
  grade_score: number;
  sqft_above: number;
  sqft_basement: number;
  yr_built: number;
  yr_renovated: number;
  zipcode: string;
  latitude?: number;
  longitude?: number;
}

export interface ConfidenceRange {
  lower_bound: number;
  upper_bound: number;
}

export interface FeatureFactor {
  feature: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
  label: string;
}

export interface PredictionResponse {
  prediction_id: string;
  predicted_price: number;
  confidence_range: ConfidenceRange;
  model_version: string;
  algorithm: string;
  feature_factors: FeatureFactor[];
  latency_ms: number;
  created_at: string;
}

export interface PredictionHistoryItem {
  id: string;
  predicted_price: number;
  model_version: string;
  input_features: Record<string, any>;
  latency_ms: number;
  created_at: string;
}

export interface PredictionHistoryResponse {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: PredictionHistoryItem[];
}

export interface MarketSummary {
  total_sales: number;
  median_price: number;
  mean_price: number;
  std_price: number;
  min_price: number;
  max_price: number;
  avg_price_per_sqft: number;
  median_living_sqft: number;
  waterfront_premium_ratio: number;
  renovation_premium_amount: number;
  top_expensive_zip: string;
  top_affordable_zip: string;
}

export interface HistogramBin {
  bin_range: string;
  bin_start: number;
  bin_end: number;
  count: number;
}

export interface PriceDistributionResponse {
  total_samples: number;
  bins: HistogramBin[];
}

export interface LocationMetric {
  zipcode: string;
  property_count: number;
  avg_price: number;
  median_price: number;
  avg_price_per_sqft: number;
  latitude: number;
  longitude: number;
}

export interface FeatureCorrelation {
  feature: string;
  correlation: number;
  description: string;
}

export interface ModelVersion {
  id: string;
  version: string;
  algorithm: string;
  mae: number;
  rmse: number;
  r2: number;
  is_active: boolean;
  trained_at: string;
  hyperparameters: Record<string, any>;
  feature_names: string[];
}
