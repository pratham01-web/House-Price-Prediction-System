import React, { useState, useEffect } from "react";
import {
  Calculator,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Printer,
  DollarSign,
  Percent,
  Home,
  ArrowRight,
} from "lucide-react";
import { api } from "../lib/api";
import { PredictionResponse, PredictionInput, Property } from "../types/api";
import { formatCurrency } from "../lib/utils";

const KING_COUNTY_ZIPS = [
  { code: "98001", name: "Auburn / Algona" },
  { code: "98002", name: "Auburn Downtown" },
  { code: "98003", name: "Federal Way" },
  { code: "98004", name: "Bellevue Downtown (Premier Eastside)" },
  { code: "98005", name: "Bellevue East" },
  { code: "98006", name: "Bellevue South / Somerset" },
  { code: "98007", name: "Bellevue Crossroads" },
  { code: "98008", name: "Bellevue Lake Hills" },
  { code: "98010", name: "Black Diamond" },
  { code: "98011", name: "Bothell" },
  { code: "98014", name: "Carnation" },
  { code: "98019", name: "Duvall" },
  { code: "98022", name: "Enumclaw" },
  { code: "98023", name: "Federal Way West" },
  { code: "98024", name: "Fall City" },
  { code: "98027", name: "Issaquah" },
  { code: "98028", name: "Kenmore" },
  { code: "98029", name: "Issaquah Highlands" },
  { code: "98030", name: "Kent East Hill" },
  { code: "98031", name: "Kent Valley" },
  { code: "98032", name: "Kent West" },
  { code: "98033", name: "Kirkland Downtown / Waterfront" },
  { code: "98034", name: "Kirkland North / Kingsgate" },
  { code: "98038", name: "Maple Valley" },
  { code: "98039", name: "Medina (Ultra-Luxury Enclave)" },
  { code: "98040", name: "Mercer Island" },
  { code: "98042", name: "Kent / Covington" },
  { code: "98045", name: "North Bend" },
  { code: "98052", name: "Redmond (Tech Core)" },
  { code: "98053", name: "Redmond Ridge" },
  { code: "98055", name: "Renton South" },
  { code: "98056", name: "Renton Highlands" },
  { code: "98058", name: "Renton Fairwood" },
  { code: "98059", name: "Renton Newcastle" },
  { code: "98065", name: "Snoqualmie" },
  { code: "98070", name: "Vashon Island" },
  { code: "98072", name: "Woodinville Wine Country" },
  { code: "98074", name: "Sammamish Plateau" },
  { code: "98075", name: "Sammamish South" },
  { code: "98077", name: "Woodinville Hollywood Hill" },
  { code: "98092", name: "Auburn Lea Hill" },
  { code: "98102", name: "Seattle Capitol Hill East" },
  { code: "98103", name: "Seattle Green Lake / Fremont" },
  { code: "98105", name: "Seattle University District" },
  { code: "98106", name: "Seattle Delridge" },
  { code: "98107", name: "Seattle Ballard / Waterfront" },
  { code: "98108", name: "Seattle Beacon Hill" },
  { code: "98109", name: "Seattle Queen Anne East" },
  { code: "98112", name: "Seattle Madison Park / Washington Park" },
  { code: "98115", name: "Seattle Ravenna / Wedgwood" },
  { code: "98116", name: "West Seattle Alki Beach" },
  { code: "98117", name: "Seattle Sunset Hill / Crown Hill" },
  { code: "98118", name: "Seattle Columbia City" },
  { code: "98119", name: "Seattle Queen Anne West" },
  { code: "98122", name: "Seattle Central District" },
  { code: "98125", name: "Seattle Lake City" },
  { code: "98126", name: "West Seattle High Point" },
  { code: "98133", name: "Seattle Bitter Lake" },
  { code: "98136", name: "West Seattle Fauntleroy" },
  { code: "98144", name: "Seattle Mount Baker" },
  { code: "98146", name: "Seattle Burien North" },
  { code: "98148", name: "Burien" },
  { code: "98155", name: "Shoreline East" },
  { code: "98166", name: "Normandy Park" },
  { code: "98168", name: "Tukwila / Boulevard Park" },
  { code: "98177", name: "Shoreline Innis Arden" },
  { code: "98178", name: "Seattle Rainier Beach" },
  { code: "98188", name: "SeaTac" },
  { code: "98198", name: "Des Moines" },
  { code: "98199", name: "Seattle Magnolia" },
];

const PRESETS = [
  {
    name: "Seattle Craftsman",
    subtitle: "Green Lake · 98103",
    data: {
      bedrooms: 3,
      bathrooms: 2.0,
      sqft_living: 1850,
      sqft_lot: 4500,
      floors: 1.5,
      waterfront: 0,
      view_score: 1,
      condition_score: 4,
      grade_score: 8,
      sqft_above: 1350,
      sqft_basement: 500,
      yr_built: 1948,
      yr_renovated: 2005,
      zipcode: "98103",
    },
  },
  {
    name: "Bellevue Tech Executive",
    subtitle: "Downtown Core · 98004",
    data: {
      bedrooms: 4,
      bathrooms: 3.5,
      sqft_living: 3400,
      sqft_lot: 9200,
      floors: 2.0,
      waterfront: 0,
      view_score: 2,
      condition_score: 4,
      grade_score: 10,
      sqft_above: 2700,
      sqft_basement: 700,
      yr_built: 2004,
      yr_renovated: 0,
      zipcode: "98004",
    },
  },
  {
    name: "Medina Lakefront Estate",
    subtitle: "Gold Coast · 98039",
    data: {
      bedrooms: 5,
      bathrooms: 4.75,
      sqft_living: 5800,
      sqft_lot: 24000,
      floors: 2.0,
      waterfront: 1,
      view_score: 4,
      condition_score: 5,
      grade_score: 12,
      sqft_above: 4600,
      sqft_basement: 1200,
      yr_built: 2008,
      yr_renovated: 0,
      zipcode: "98039",
    },
  },
  {
    name: "Redmond Suburban Modern",
    subtitle: "Tech Corridor · 98052",
    data: {
      bedrooms: 4,
      bathrooms: 2.5,
      sqft_living: 2550,
      sqft_lot: 7500,
      floors: 2.0,
      waterfront: 0,
      view_score: 0,
      condition_score: 4,
      grade_score: 9,
      sqft_above: 2150,
      sqft_basement: 400,
      yr_built: 1998,
      yr_renovated: 0,
      zipcode: "98052",
    },
  },
  {
    name: "Auburn Starter Home",
    subtitle: "South Valley · 98002",
    data: {
      bedrooms: 3,
      bathrooms: 1.5,
      sqft_living: 1450,
      sqft_lot: 6200,
      floors: 1.0,
      waterfront: 0,
      view_score: 0,
      condition_score: 3,
      grade_score: 7,
      sqft_above: 1450,
      sqft_basement: 0,
      yr_built: 1984,
      yr_renovated: 0,
      zipcode: "98002",
    },
  },
];

interface PredictorTabProps {
  prefilledProperty?: Property | null;
}

export const PredictorTab: React.FC<PredictorTabProps> = ({ prefilledProperty }) => {
  const [formData, setFormData] = useState<PredictionInput>({
    bedrooms: 4,
    bathrooms: 2.5,
    sqft_living: 2600,
    sqft_lot: 7500,
    floors: 2.0,
    waterfront: 0,
    view_score: 0,
    condition_score: 4,
    grade_score: 8,
    sqft_above: 2100,
    sqft_basement: 500,
    yr_built: 1995,
    yr_renovated: 0,
    zipcode: "98052",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledProperty) {
      setFormData({
        bedrooms: prefilledProperty.bedrooms,
        bathrooms: prefilledProperty.bathrooms,
        sqft_living: prefilledProperty.sqft_living,
        sqft_lot: prefilledProperty.sqft_lot,
        floors: prefilledProperty.floors,
        waterfront: prefilledProperty.waterfront,
        view_score: prefilledProperty.view_score,
        condition_score: prefilledProperty.condition_score,
        grade_score: prefilledProperty.grade_score,
        sqft_above: prefilledProperty.sqft_above,
        sqft_basement: prefilledProperty.sqft_basement,
        yr_built: prefilledProperty.yr_built,
        yr_renovated: prefilledProperty.yr_renovated || 0,
        zipcode: prefilledProperty.zipcode,
      });
    }
  }, [prefilledProperty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const pred = await api.predictPrice(formData);
      setResult(pred);
    } catch (err: any) {
      setError(err.message || "Valuation model inference failed.");
    } finally {
      setLoading(false);
    }
  };

  // Financial Estimates calculated from predicted valuation
  const price = result?.predicted_price || 0;
  const estimatedRent = Math.round(price * 0.0055);
  const annualRent = estimatedRent * 12;
  const capRate = price > 0 ? ((annualRent / price) * 100).toFixed(2) : "0.00";

  // 30-year fixed loan @ 6.5% with 20% down
  const loanPrincipal = price * 0.8;
  const monthlyRate = 0.065 / 12;
  const monthlyPI = price > 0 ? (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, 360))) / (Math.pow(1 + monthlyRate, 360) - 1) : 0;
  const monthlyTax = (price * 0.01025) / 12;
  const totalMonthlyHolding = Math.round(monthlyPI + monthlyTax + 125);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Scenario Presets Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-neutral-850 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
            Benchmark Archetype Presets
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">
            1-Click Populate Real King County Housing Archetypes
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setFormData(p.data);
                setResult(null);
              }}
              className="p-3 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-700 text-left transition-all group"
            >
              <p className="text-xs font-bold text-white group-hover:text-white truncate">{p.name}</p>
              <p className="text-[10px] text-neutral-400 font-mono truncate">{p.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Valuation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Terminal (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-2xl border border-neutral-850 space-y-6 shadow-terminal">
          <div className="flex items-center justify-between border-b border-neutral-850 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Property Specification Matrix
                </h3>
                <p className="text-xs text-neutral-400">
                  Parameters will be fed into the versioned tree ensemble estimator
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300">
              14 Validated Features
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Spatial Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  <span>King County Sub-Market (ZIP Code)</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-500">70 Verified Geographic Zones</span>
              </label>
              <select
                value={formData.zipcode}
                onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs bg-neutral-950 text-white font-mono"
              >
                {KING_COUNTY_ZIPS.map((z) => (
                  <option key={z.code} value={z.code}>
                    ZIP {z.code} — {z.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Core Physical Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-neutral-300 font-medium">Bedrooms</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 1 })}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-medium">Bathrooms</label>
                <input
                  type="number"
                  min="0.5"
                  max="8"
                  step="0.25"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) || 1 })}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-medium">Finished Living (SF)</label>
                <input
                  type="number"
                  min="300"
                  max="14000"
                  step="50"
                  value={formData.sqft_living}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1000;
                    setFormData({
                      ...formData,
                      sqft_living: val,
                      sqft_above: Math.max(val - formData.sqft_basement, 0),
                    });
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-medium">Lot Size (SF)</label>
                <input
                  type="number"
                  min="500"
                  max="1000000"
                  step="500"
                  value={formData.sqft_lot}
                  onChange={(e) => setFormData({ ...formData, sqft_lot: parseInt(e.target.value) || 5000 })}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  required
                />
              </div>
            </div>

            {/* Quality & Construction Ratings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-neutral-300 font-medium flex items-center justify-between">
                  <span>Construction Grade</span>
                  <span className="text-[10px] font-mono text-white">{formData.grade_score}/13</span>
                </label>
                <select
                  value={formData.grade_score}
                  onChange={(e) => setFormData({ ...formData, grade_score: parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs bg-neutral-950"
                >
                  <option value="6">Grade 6 - Low Quality Cabin</option>
                  <option value="7">Grade 7 - Average Construction</option>
                  <option value="8">Grade 8 - Good Builder Grade</option>
                  <option value="9">Grade 9 - Better Architectural</option>
                  <option value="10">Grade 10 - Very Good Luxury</option>
                  <option value="11">Grade 11 - Custom High Luxury</option>
                  <option value="12">Grade 12 - Custom Mansion</option>
                  <option value="13">Grade 13 - World-Class Estate</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-medium flex items-center justify-between">
                  <span>Physical Condition</span>
                  <span className="text-[10px] font-mono text-white">{formData.condition_score}/5</span>
                </label>
                <select
                  value={formData.condition_score}
                  onChange={(e) => setFormData({ ...formData, condition_score: parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs bg-neutral-950"
                >
                  <option value="1">1 - Poor / Major Repairs</option>
                  <option value="2">2 - Fair / Deferred Wear</option>
                  <option value="3">3 - Average Maintenance</option>
                  <option value="4">4 - Good / Well Maintained</option>
                  <option value="5">5 - Pristine / Like New</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-medium">Stories / Floors</label>
                <select
                  value={formData.floors}
                  onChange={(e) => setFormData({ ...formData, floors: parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs bg-neutral-950"
                >
                  <option value="1">1.0 Story (Ranch)</option>
                  <option value="1.5">1.5 Story (Cape Cod)</option>
                  <option value="2">2.0 Stories (Colonial/Modern)</option>
                  <option value="2.5">2.5 Stories</option>
                  <option value="3">3.0 Stories (Urban Townhome)</option>
                </select>
              </div>
            </div>

            {/* Waterfront & View Premiums */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-neutral-300 font-medium">Waterfront Access</label>
                <select
                  value={formData.waterfront}
                  onChange={(e) => setFormData({ ...formData, waterfront: parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs bg-neutral-950 font-mono"
                >
                  <option value="0">0 - No Waterfront</option>
                  <option value="1">1 - Direct Waterfront (+3.11x Alpha)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-medium">Scenic View Rating</label>
                <select
                  value={formData.view_score}
                  onChange={(e) => setFormData({ ...formData, view_score: parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs bg-neutral-950 font-mono"
                >
                  <option value="0">0 - Standard / Territorial</option>
                  <option value="1">1 - Fair View</option>
                  <option value="2">2 - Average Territorial</option>
                  <option value="3">3 - Good Water/Mountain</option>
                  <option value="4">4 - Panoramic Lake/Rainier</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-medium">Finished Basement (SF)</label>
                <input
                  type="number"
                  min="0"
                  max="4000"
                  step="50"
                  value={formData.sqft_basement}
                  onChange={(e) => {
                    const bVal = parseInt(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      sqft_basement: bVal,
                      sqft_above: Math.max(formData.sqft_living - bVal, 0),
                    });
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>
            </div>

            {/* Vintage & Modernization */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-300 font-medium">Year Built</label>
                <input
                  type="number"
                  min="1900"
                  max="2026"
                  value={formData.yr_built}
                  onChange={(e) => setFormData({ ...formData, yr_built: parseInt(e.target.value) || 1990 })}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-medium">Year Renovated (0 if original)</label>
                <input
                  type="number"
                  min="0"
                  max="2026"
                  value={formData.yr_renovated}
                  onChange={(e) => setFormData({ ...formData, yr_renovated: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-sm shadow-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Computing Tree-Ensemble Valuation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Calculate Institutional Fair Market Valuation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Valuation Memorandum (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-neutral-800 space-y-5 shadow-terminal relative overflow-hidden animate-fadeIn">
              <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
                <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Valuation Computed & Audited</span>
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {result.latency_ms} ms Latency
                </span>
              </div>

              {/* Main Valuation Heading */}
              <div className="space-y-1">
                <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider">
                  Estimated Fair Market Value (FMV)
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
                  {formatCurrency(result.predicted_price)}
                </div>
              </div>

              {/* 1-Sigma Empirical Confidence Band */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">1-Sigma Empirical Spread</span>
                  <span className="text-white font-bold">
                    {formatCurrency(result.confidence_range.lower_bound)} – {formatCurrency(result.confidence_range.upper_bound)}
                  </span>
                </div>
                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                  <div className="bg-white h-full w-3/5 mx-auto rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>-MAE ($69k)</span>
                  <span>Target Point</span>
                  <span>+MAE ($69k)</span>
                </div>
              </div>

              {/* Institutional Investment Projections */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold">Est. Monthly Market Rent</span>
                  <p className="text-base font-bold text-white">{formatCurrency(estimatedRent)}/mo</p>
                  <p className="text-[10px] text-emerald-400">{capRate}% Gross Cap Rate</p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold">Est. Total Monthly Holding</span>
                  <p className="text-base font-bold text-white">{formatCurrency(totalMonthlyHolding)}/mo</p>
                  <p className="text-[10px] text-neutral-400">P&I (6.5%) + Tax + Ins</p>
                </div>
              </div>

              {/* Value Factor Decomposition */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Deterministic Feature Impact Decomposition
                </h4>
                <div className="space-y-2">
                  {result.feature_factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 text-xs flex items-center justify-between"
                    >
                      <span className="text-neutral-300 font-medium">{factor.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          factor.impact === "positive"
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                            : factor.impact === "negative"
                            ? "bg-rose-950/40 text-rose-400 border border-rose-500/30"
                            : "bg-neutral-900 text-neutral-400"
                        }`}
                      >
                        {factor.impact.toUpperCase()} IMPACT
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Toolbar & Audit Footer */}
              <div className="pt-3 border-t border-neutral-850 flex items-center justify-between">
                <div className="text-[10px] text-neutral-500 font-mono">
                  <span>ID: {result.prediction_id.slice(0, 10)}...</span>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 text-xs font-semibold transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Print Appraisal Memo</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-neutral-850 text-center space-y-4 shadow-terminal">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white">Valuation Engine Standing By</h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                  Select a benchmark archetype above or enter customized physical characteristics to execute real-time valuation inference.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 text-[11px] text-neutral-400 text-left space-y-1.5">
                <p className="font-semibold text-white flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Zero-Synthetic Valuation Pipeline</span>
                </p>
                <p className="text-neutral-400 leading-snug">
                  Predictions are calculated by the serialized Scikit-learn HistGradientBoosting model trained on 17,290 King County transactions and validated on 4,323 holdout deeds (R² 0.88).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
