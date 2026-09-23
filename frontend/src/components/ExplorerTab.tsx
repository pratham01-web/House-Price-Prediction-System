import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Home,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  MapPin,
  Waves,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
} from "lucide-react";
import { api } from "../lib/api";
import { Property } from "../types/api";
import { formatCurrency, formatNumber } from "../lib/utils";

export const ExplorerTab: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [zipcode, setZipcode] = useState<string>("");
  const [waterfront, setWaterfront] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("price");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  // Selected property modal
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProperties({
        page,
        page_size: 18,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        bedrooms: bedrooms !== "" ? parseInt(bedrooms) : undefined,
        zipcode: zipcode || undefined,
        waterfront: waterfront !== "" ? parseInt(waterfront) : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setProperties(res.items);
      setTotalCount(res.total_count);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, sortBy, sortOrder]);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProperties();
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setZipcode("");
    setWaterfront("");
    setSortBy("price");
    setSortOrder("desc");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Multidimensional Property Search
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {formatNumber(totalCount)} Verified Records in PostgreSQL
          </span>
        </div>

        <form onSubmit={handleApplyFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Price Range */}
          <div>
            <label className="text-[11px] text-slate-400 font-medium">Min Price ($)</label>
            <input
              type="number"
              placeholder="e.g. 300000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-lg glass-input text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium">Max Price ($)</label>
            <input
              type="number"
              placeholder="e.g. 1200000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-lg glass-input text-xs"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="text-[11px] text-slate-400 font-medium">Bedrooms</label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-lg glass-input text-xs bg-slate-900"
            >
              <option value="">Any Bedrooms</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>
          </div>

          {/* King County Zipcode */}
          <div>
            <label className="text-[11px] text-slate-400 font-medium">Zip Code</label>
            <input
              type="text"
              placeholder="e.g. 98052, 98039"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-lg glass-input text-xs"
            />
          </div>

          {/* Waterfront */}
          <div>
            <label className="text-[11px] text-slate-400 font-medium">Waterfront</label>
            <select
              value={waterfront}
              onChange={(e) => setWaterfront(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-lg glass-input text-xs bg-slate-900"
            >
              <option value="">Any</option>
              <option value="1">Waterfront Only</option>
              <option value="0">Standard Inland</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Sort & Result Counter Bar */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-900 pt-3 text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-medium">{properties.length}</span> properties on page {page} of {totalPages}
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200"
              >
                <option value="price">Price</option>
                <option value="sqft_living">Living Space</option>
                <option value="yr_built">Year Built</option>
                <option value="grade_score">Grade Score</option>
              </select>
            </div>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Querying PostgreSQL properties index...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl glass-panel border border-red-500/30 text-center space-y-2">
          <p className="text-sm font-semibold text-red-400">Failed to load real properties</p>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-2xl border border-slate-800 space-y-2">
          <Home className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No properties match your filter criteria</p>
          <p className="text-xs text-slate-500">Try adjusting price or bedroom filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((prop) => (
            <div
              key={prop.id}
              onClick={() => setSelectedProperty(prop)}
              className="glass-panel-interactive p-4 rounded-xl border border-slate-800/80 cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{prop.external_id}</span>
                    <h4 className="text-xl font-bold text-white tracking-tight">
                      {formatCurrency(prop.price)}
                    </h4>
                  </div>
                  {prop.waterfront === 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] flex items-center space-x-1 font-semibold">
                      <Waves className="w-3 h-3" />
                      <span>Waterfront</span>
                    </span>
                  )}
                  {prop.grade_score >= 10 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] flex items-center space-x-1 font-semibold">
                      <Award className="w-3 h-3" />
                      <span>Grade {prop.grade_score}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>King County, WA {prop.zipcode}</span>
                </div>
              </div>

              {/* Physical Spec Badges */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-900 text-xs">
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Bed className="w-3.5 h-3.5 text-slate-400" />
                  <span>{prop.bedrooms} Beds</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Bath className="w-3.5 h-3.5 text-slate-400" />
                  <span>{prop.bathrooms} Baths</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{prop.sqft_living.toLocaleString()} sqft</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Built {prop.yr_built} {prop.yr_renovated > 0 && `(Reno ${prop.yr_renovated})`}</span>
                <span className="text-indigo-400 flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>Inspect Spec</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono text-slate-400">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel max-w-2xl w-full rounded-2xl p-6 border border-slate-700 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-indigo-400">Parcel: {selectedProperty.external_id}</span>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {formatCurrency(selectedProperty.price)}
                </h3>
                <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>King County, WA {selectedProperty.zipcode} (Lat: {selectedProperty.latitude}, Long: {selectedProperty.longitude})</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Bedrooms</span>
                <p className="text-base font-bold text-white">{selectedProperty.bedrooms}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Bathrooms</span>
                <p className="text-base font-bold text-white">{selectedProperty.bathrooms}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Living Area</span>
                <p className="text-base font-bold text-white">{selectedProperty.sqft_living.toLocaleString()} sqft</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Lot Size</span>
                <p className="text-base font-bold text-white">{selectedProperty.sqft_lot.toLocaleString()} sqft</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Above Ground</span>
                <p className="text-base font-bold text-white">{selectedProperty.sqft_above.toLocaleString()} sqft</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Basement Area</span>
                <p className="text-base font-bold text-white">{selectedProperty.sqft_basement.toLocaleString()} sqft</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Grade Rating</span>
                <p className="text-base font-bold text-white">{selectedProperty.grade_score} / 13</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Condition</span>
                <p className="text-base font-bold text-white">{selectedProperty.condition_score} / 5</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <span className="font-semibold text-slate-200">Neighborhood Comparison Context</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Nearest 15 homes average {selectedProperty.sqft_living15?.toLocaleString() || "N/A"} sqft interior living space and {selectedProperty.sqft_lot15?.toLocaleString() || "N/A"} sqft lot. Sale transaction was legally finalized on {selectedProperty.sale_date || "2014-2015"}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
