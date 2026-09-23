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
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  ArrowRight,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { api } from "../lib/api";
import { Property } from "../types/api";
import { formatCurrency, formatNumber } from "../lib/utils";

interface ExplorerTabProps {
  onSendToPredictor?: (property: Property) => void;
}

export const ExplorerTab: React.FC<ExplorerTabProps> = ({ onSendToPredictor }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filters
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [zipcode, setZipcode] = useState<string>("");
  const [waterfront, setWaterfront] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("price");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  // Active quick chip
  const [activeChip, setActiveChip] = useState<string>("all");

  // Selected property modal
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProperties({
        page,
        page_size: viewMode === "grid" ? 18 : 25,
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
      setError(err.message || "Failed to load properties from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, sortBy, sortOrder, viewMode]);

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
    setActiveChip("all");
    setPage(1);
  };

  const applyQuickChip = (chip: string) => {
    setActiveChip(chip);
    setPage(1);
    if (chip === "all") {
      handleReset();
    } else if (chip === "waterfront") {
      setWaterfront("1");
      setMinPrice("");
      setMaxPrice("");
      setZipcode("");
      setBedrooms("");
    } else if (chip === "luxury") {
      setMinPrice("1000000");
      setMaxPrice("");
      setWaterfront("");
      setZipcode("");
    } else if (chip === "affordable") {
      setMinPrice("");
      setMaxPrice("450000");
      setWaterfront("");
      setZipcode("");
    } else if (chip === "eastside") {
      setZipcode("98004");
      setMinPrice("");
      setMaxPrice("");
      setWaterfront("");
    } else if (chip === "seattle") {
      setZipcode("98103");
      setMinPrice("");
      setMaxPrice("");
      setWaterfront("");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Quick Filter Chips Ribbon */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 select-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mr-2 flex-shrink-0">
          Screener Presets:
        </span>
        {[
          { id: "all", label: "All Deeds (21,613)" },
          { id: "waterfront", label: "🌊 Waterfront Properties (3.11x Alpha)" },
          { id: "luxury", label: "💎 Luxury Tier ($1M+)" },
          { id: "affordable", label: "🏷️ Below Median (<$450k)" },
          { id: "eastside", label: "🌲 Bellevue Core (98004)" },
          { id: "seattle", label: "🏙️ Seattle Green Lake (98103)" },
        ].map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => applyQuickChip(chip.id)}
            className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all border ${
              activeChip === chip.id
                ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-semibold shadow-sm"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Main Filter & Control Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-terminal">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Multidimensional Property Screener
            </h3>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <form onSubmit={handleApplyFilter} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 font-medium">Min Price ($)</label>
            <input
              type="number"
              placeholder="e.g. 300000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium">Max Price ($)</label>
            <input
              type="number"
              placeholder="e.g. 1200000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium">Min Bedrooms</label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-xl glass-input text-xs bg-slate-900"
            >
              <option value="">Any Bedrooms</option>
              <option value="1">1+ Bed</option>
              <option value="2">2+ Beds</option>
              <option value="3">3+ Beds</option>
              <option value="4">4+ Beds</option>
              <option value="5">5+ Beds</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium">ZIP Code</label>
            <input
              type="text"
              placeholder="e.g. 98052"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium">Waterfront</label>
            <select
              value={waterfront}
              onChange={(e) => setWaterfront(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-xl glass-input text-xs bg-slate-900"
            >
              <option value="">All Locations</option>
              <option value="1">Direct Waterfront</option>
              <option value="0">No Waterfront</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow transition-all flex items-center justify-center space-x-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Apply Screener</span>
            </button>
          </div>
        </form>

        {/* View Mode & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-850 text-xs text-slate-400 gap-3">
          <div className="font-mono">
            Showing <span className="text-white font-bold">{properties.length}</span> of{" "}
            <span className="text-indigo-400 font-bold">{formatNumber(totalCount)}</span> matching records
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${
                  viewMode === "grid" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded ${
                  viewMode === "table" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Dense Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sort Dropdowns */}
            <div className="flex items-center space-x-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 font-mono"
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
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 font-mono"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Loading / Error / Empty / Grid / Table */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Querying PostgreSQL properties index...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl glass-panel border border-red-500/30 text-center space-y-2">
          <p className="text-sm font-semibold text-red-400">Failed to load properties</p>
          <p className="text-xs text-slate-400 font-mono">{error}</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-2xl border border-slate-800 space-y-2">
          <Home className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No properties match your filter criteria</p>
          <p className="text-xs text-slate-500">Try adjusting price or bedroom filters</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((prop) => (
            <div
              key={prop.id}
              onClick={() => setSelectedProperty(prop)}
              className="glass-panel-interactive p-4 sm:p-5 rounded-2xl border border-slate-800/80 cursor-pointer space-y-3 flex flex-col justify-between shadow-sm hover:border-indigo-500/30 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{prop.external_id}</span>
                    <h4 className="text-2xl font-bold text-white tracking-tight font-mono">
                      {formatCurrency(prop.price)}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
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
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>King County, WA {prop.zipcode}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-300">${Math.round(prop.price / Math.max(prop.sqft_living, 1))}/SF</span>
                </div>
              </div>

              {/* Physical Spec Badges */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-900 text-xs font-mono">
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
                  <span>{prop.sqft_living.toLocaleString()} SF</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Built {prop.yr_built} {prop.yr_renovated ? `(Reno ${prop.yr_renovated})` : ""}</span>
                
                {onSendToPredictor && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendToPredictor(prop);
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[10px] font-bold transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    <span>Valuate in Studio</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Dense Table View */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-terminal">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase bg-slate-900/60 font-mono">
                  <th className="py-3 px-3">Parcel ID</th>
                  <th className="py-3 px-3">Closing Price</th>
                  <th className="py-3 px-3">Beds / Baths</th>
                  <th className="py-3 px-3">Living Space</th>
                  <th className="py-3 px-3">Rate/SF</th>
                  <th className="py-3 px-3">Grade</th>
                  <th className="py-3 px-3">Waterfront</th>
                  <th className="py-3 px-3">ZIP Code</th>
                  <th className="py-3 px-3">Built</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono text-[11px]">
                {properties.map((prop) => (
                  <tr
                    key={prop.id}
                    onClick={() => setSelectedProperty(prop)}
                    className="hover:bg-slate-900/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 text-slate-400">{prop.external_id}</td>
                    <td className="py-3 px-3 font-bold text-white text-sm">
                      {formatCurrency(prop.price)}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {prop.bedrooms}b / {prop.bathrooms}ba
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {prop.sqft_living.toLocaleString()} SF
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      ${Math.round(prop.price / Math.max(prop.sqft_living, 1))}/SF
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        prop.grade_score >= 10
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "text-slate-300"
                      }`}>
                        Grade {prop.grade_score}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {prop.waterfront === 1 ? (
                        <span className="text-cyan-400 font-bold">Yes (Direct)</span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{prop.zipcode}</td>
                    <td className="py-3 px-3 text-slate-400">{prop.yr_built}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {onSendToPredictor && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSendToPredictor(prop);
                            }}
                            className="px-2 py-0.5 rounded bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[10px] font-semibold transition-all flex items-center space-x-1"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
                            <span>Valuate</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedProperty(prop)}
                          className="text-slate-400 hover:text-indigo-400 p-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-850 transition-all font-mono"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono text-slate-400">
            Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-850 transition-all font-mono"
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
                <span className="text-xs font-mono text-indigo-400">Recorded Parcel: {selectedProperty.external_id}</span>
                <h3 className="text-3xl font-extrabold text-white tracking-tight font-mono">
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
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
                <p className="text-base font-bold text-white">{selectedProperty.sqft_living.toLocaleString()} SF</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Lot Size</span>
                <p className="text-base font-bold text-white">{selectedProperty.sqft_lot.toLocaleString()} SF</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Above Ground</span>
                <p className="text-base font-bold text-white">{selectedProperty.sqft_above.toLocaleString()} SF</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Basement Area</span>
                <p className="text-base font-bold text-white">{selectedProperty.sqft_basement.toLocaleString()} SF</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Construction Grade</span>
                <p className="text-base font-bold text-white">{selectedProperty.grade_score} / 13</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Physical Condition</span>
                <p className="text-base font-bold text-white">{selectedProperty.condition_score} / 5</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
              <span className="font-semibold text-slate-200">Neighborhood Spatial Context</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Nearest 15 homes average {selectedProperty.sqft_living15?.toLocaleString() || "N/A"} SF interior living space and {selectedProperty.sqft_lot15?.toLocaleString() || "N/A"} SF lot. Transaction was officially recorded on {selectedProperty.sale_date || "2014-2015"}.
              </p>
            </div>

            {onSendToPredictor && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onSendToPredictor(selectedProperty);
                    setSelectedProperty(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow transition-all flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Send to Valuation Studio for Live Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
