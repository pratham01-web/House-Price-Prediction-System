# 04. Dataset Specification: King County House Sales

## 1. Provenance & Attribution

- **Dataset Name**: King County House Sales (Seattle Metropolitan Area, Washington, USA)
- **Primary Source**: King County Department of Assessments
- **Curated Distribution**: OpenML Dataset ID `42092` / `42079` (`house_sales`)
- **Temporal Coverage**: Real estate sales recorded between May 2014 and May 2015
- **Record Count**: 21,613 observations
- **Target Variable**: `price` (Continuous numeric, recorded transaction price in USD)
- **Licensing**: Public Domain / Open Government Data (King County Open Data License)

---

## 2. Feature Dictionary

| Feature | Type | Units / Range | Description |
| :--- | :--- | :--- | :--- |
| `id` | Categorical / String | Unique Key | County property tax parcel / transaction record identifier |
| `date` | Timestamp | ISO 8601 Date | Date the home sale was legally registered |
| `price` | Numeric | $75,000 – $7,700,000 | Actual closing transaction price in USD (Target) |
| `bedrooms` | Integer | 0 – 33 | Total count of bedrooms in the residence |
| `bathrooms` | Float | 0 – 8.0 | Count of bathrooms (0.5 = powder room, 0.75 = shower no tub, 1.0 = full) |
| `sqft_living` | Integer | 290 – 13,540 sqft | Interior living space footage |
| `sqft_lot` | Integer | 520 – 1,651,359 sqft | Land lot square footage |
| `floors` | Float | 1.0 – 3.5 | Number of stories/levels |
| `waterfront` | Binary | 0 or 1 | 1 indicates direct water frontage (lake, sound, river) |
| `view` | Integer | 0 – 4 | Qualitative rating of property view quality (0=none, 4=panoramic) |
| `condition` | Integer | 1 – 5 | Relative physical wear/maintenance condition (1=poor, 5=excellent) |
| `grade` | Integer | 1 – 13 | King County construction quality grade (1-3 poor, 7 average, 11-13 mansion) |
| `sqft_above` | Integer | 290 – 9,410 sqft | Living space square footage strictly above ground level |
| `sqft_basement` | Integer | 0 – 4,820 sqft | Square footage of basement area |
| `yr_built` | Integer | 1900 – 2015 | Original construction year |
| `yr_renovated` | Integer | 0 – 2015 | Year of last structural renovation (0 if never renovated) |
| `zipcode` | Categorical | 98001 – 98199 | US Postal ZIP Code in King County (70 distinct zones) |
| `lat` | Float | 47.1559 – 47.7776 | North geographic coordinate |
| `long` | Float | -122.519 – -121.315 | West geographic coordinate |
| `sqft_living15` | Integer | 399 – 6,210 sqft | Average interior living space of the 15 nearest neighboring homes |
| `sqft_lot15` | Integer | 651 – 871,200 sqft | Average land lot square footage of the 15 nearest neighboring homes |

---

## 3. Data Hygiene & Validation Rules

1. **Target Integrity**: Drop any record with `price <= 0` or null price (none in King County raw, but enforced by pipeline).
2. **Physical Outliers**:
   - The famous `bedrooms == 33` entry (with 1,620 sqft living) is a known recording typographical error for 3 bedrooms; cleaned deterministically or filtered.
   - Zero-bedroom or zero-bathroom residences must be verified as valid studio/undeveloped lots or handled during ingestion.
3. **Renovation Recoding**:
   - Create boolean feature `is_renovated = (yr_renovated > 0)`.
   - Compute `effective_age = sale_year - max(yr_built, yr_renovated)`.
4. **Leakage Prevention**:
   - All scalers, imputers, and target encoders MUST be fitted strictly on the Training split ($80\%$) and applied out-of-sample to Validation and Test splits.
