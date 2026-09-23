import React, { useState } from "react";
import {
  Calculator,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { api } from "../lib/api";
import { PredictionResponse, PredictionInput } from "../types/api";
import { formatCurrency } from "../lib/utils";

const KING_COUNTY_ZIPS = [
  { code: "98001", name: "Auburn / Algona" },
  { code: "98002", name: "Auburn Downtown" },
  { code: "98003", name: "Federal Way" },
  { code: "98004", name: "Bellevue Downtown" },
  { code: "98005", name: "Bellevue East" },
  { code: "98006", name: "Bellevue South" },
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
  { code: "98033", name: "Kirkland Downtown" },
  { code: "98034", name: "Kirkland North / Kingsgate" },
  { code: "98038", name: "Maple Valley" },
  { code: "98039", name: "Medina (Premier Luxury)" },
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
  { code: "98072", name: "Woodinville" },
  { code: "98074", name: "Sammamish Plateau" },
  { code: "98075", name: "Sammamish South" },
  { code: "98077", name: "Woodinville Hollywood Hill" },
  { code: "98092", name: "Auburn Lea Hill" },
  { code: "98102", name: "Seattle Capitol Hill" },
  { code: "98103", name: "Seattle Green Lake / Fremont" },
  { code: "98105", name: "Seattle University District" },
  { code: "98106", name: "Seattle Delridge" },
  { code: "98107", name: "Seattle Ballard" },
  { code: "98108", name: "Seattle Beacon Hill" },
  { code: "98109", name: "Seattle Queen Anne East" },
  { code: "98112", name: "Seattle Madison Park" },
  { code: "98115", name: "Seattle Ravenna / Wedgwood" },
  { code: "98116", name: "West Seattle Alki" },
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

export const PredictorTab: React.FC = () => {
  const [formData, setFormData] = useState<PredictionInput>({
    bedrooms: 3,
    bathrooms: 2.5,
    sqft_living: 2200,
    sqft_lot: 7000,
    floors: 2.0,
    waterfront: 0,
    view_score: 0,
    condition_score: 4,
    grade_score: 8,
    sqft_above: 1800,
    sqft_basement: 400,
    yr_built: 1996,
    yr_renovated: 0,
    zipcode: "98052",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Valuation Input Form Card */}
      <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-glass">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Physical Property Valuation Form
              </h3>
              <p className="text-xs text-slate-400">
                Inputs are fed into the versioned HistGradientBoosting pipeline
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Model v1.0.0
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Spatial Location (Zip Code) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>King County Neighborhood & Zip Code</span>
            </label>
            <select
              value={formData.zipcode}
              onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs bg-slate-900 font-medium"
            >
              {KING_COUNTY_ZIPS.map((zip) => (
                <option key={zip.code} value={zip.code}>
                  {zip.code} — {zip.name}
                </option>
              ))}
            </select>
          </div>

          {/* Area Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Interior Living Area</span>
                <span className="text-indigo-400 font-mono font-bold">
                  {formData.sqft_living.toLocaleString()} sqft
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="8000"
                step="50"
                value={formData.sqft_living}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData({
                    ...formData,
                    sqft_living: val,
                    sqft_above: Math.max(300, val - formData.sqft_basement),
                  });
                }}
                className="w-full mt-2 accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Lot Size</span>
                <span className="text-indigo-400 font-mono font-bold">
                  {formData.sqft_lot.toLocaleString()} sqft
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="40000"
                step="250"
                value={formData.sqft_lot}
                onChange={(e) => setFormData({ ...formData, sqft_lot: parseInt(e.target.value) })}
                className="w-full mt-2 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Bedrooms, Bathrooms, Floors */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium">Bedrooms</label>
              <select
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((b) => (
                  <option key={b} value={b}>{b} Bedrooms</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">Bathrooms</label>
              <select
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
              >
                {[1.0, 1.5, 2.0, 2.25, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((b) => (
                  <option key={b} value={b}>{b} Baths</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">Stories / Floors</label>
              <select
                value={formData.floors}
                onChange={(e) => setFormData({ ...formData, floors: parseFloat(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
              >
                {[1.0, 1.5, 2.0, 2.5, 3.0].map((f) => (
                  <option key={f} value={f}>{f} Stories</option>
                ))}
              </select>
            </div>
          </div>

          {/* Construction Grade & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium">
                Construction Grade (King County Standard)
              </label>
              <select
                value={formData.grade_score}
                onChange={(e) => setFormData({ ...formData, grade_score: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs bg-slate-900 font-medium"
              >
                <option value="4">Grade 4 - Low / Substandard</option>
                <option value="6">Grade 6 - Low Quality</option>
                <option value="7">Grade 7 - Average Construction</option>
                <option value="8">Grade 8 - Good / Custom</option>
                <option value="9">Grade 9 - Better Quality</option>
                <option value="10">Grade 10 - Very Good</option>
                <option value="11">Grade 11 - Luxury Mansion</option>
                <option value="12">Grade 12 - Custom Architectural Masterpiece</option>
                <option value="13">Grade 13 - Highest Palace Grade</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">Physical Condition</label>
              <select
                value={formData.condition_score}
                onChange={(e) => setFormData({ ...formData, condition_score: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
              >
                <option value="1">1 - Poor / Major Deferred Work</option>
                <option value="2">2 - Fair Condition</option>
                <option value="3">3 - Average Wear & Tear</option>
                <option value="4">4 - Good / Well Maintained</option>
                <option value="5">5 - Immaculate / Pristine</option>
              </select>
            </div>
          </div>

          {/* Qualitative Features (Waterfront, View, Basement) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium">Waterfront</label>
              <select
                value={formData.waterfront}
                onChange={(e) => setFormData({ ...formData, waterfront: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
              >
                <option value="0">No Waterfront</option>
                <option value="1">Direct Waterfront</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">View Rating</label>
              <select
                value={formData.view_score}
                onChange={(e) => setFormData({ ...formData, view_score: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
              >
                <option value="0">0 - None / Standard</option>
                <option value="1">1 - Fair View</option>
                <option value="2">2 - Average Territorial</option>
                <option value="3">3 - Good Water/Mountain</option>
                <option value="4">4 - Exceptional Panoramic</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">Finished Basement</label>
              <input
                type="number"
                min="0"
                max="3000"
                step="50"
                value={formData.sqft_basement}
                onChange={(e) => setFormData({ ...formData, sqft_basement: parseInt(e.target.value) || 0 })}
                className="w-full mt-1 px-3 py-1.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          {/* Construction & Renovation Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium">Year Built</label>
              <input
                type="number"
                min="1900"
                max="2026"
                value={formData.yr_built}
                onChange={(e) => setFormData({ ...formData, yr_built: parseInt(e.target.value) || 1990 })}
                className="w-full mt-1 px-3 py-1.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">Year Renovated (0 if none)</label>
              <input
                type="number"
                min="0"
                max="2026"
                value={formData.yr_renovated}
                onChange={(e) => setFormData({ ...formData, yr_renovated: parseInt(e.target.value) || 0 })}
                className="w-full mt-1 px-3 py-1.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-glow flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Executing Pipeline Inference...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Calculate ML Fair Market Valuation</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Output Valuation Card */}
      <div className="lg:col-span-5 space-y-6">
        {result ? (
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-500/30 space-y-6 shadow-glass relative overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-indigo-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Valuation Computed & Persisted</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {result.latency_ms} ms latency
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Estimated Fair Market Valuation
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 tracking-tight">
                {formatCurrency(result.predicted_price)}
              </div>
            </div>

            {/* Confidence Interval */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">1-Sigma Empirical Range</span>
                <span className="font-mono text-slate-200">
                  {formatCurrency(result.confidence_range.lower_bound)} – {formatCurrency(result.confidence_range.upper_bound)}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-3/5 mx-auto rounded-full" />
              </div>
            </div>

            {/* Factor Explanations */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Key Value Determinants
              </h4>
              <div className="space-y-2">
                {result.feature_factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs flex items-start space-x-2.5"
                  >
                    <div
                      className={`p-1 rounded-md mt-0.5 ${
                        factor.impact === "positive"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : factor.impact === "negative"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-slate-700/30 text-slate-400"
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-300 leading-snug">{factor.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Traceability Footer */}
            <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Audit ID: {result.prediction_id.slice(0, 8)}...</span>
              <span>Algorithm: {result.algorithm}</span>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4 shadow-glass">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Ready for Valuation</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Configure the property specifications on the left and click Calculate to run real-time inference on the active Scikit-learn model.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
              <p className="font-semibold text-slate-300 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Production Standard</span>
              </p>
              <p>Every prediction is verified out-of-sample and saved to PostgreSQL with zero mock figures.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
