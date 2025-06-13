import geopandas as gpd
import pandas as pd
import json

# Replace with the actual path to your downloaded shapefile (minified GeoJSON)
geojson_path = 'public/ny_new_york_zip_codes_geo.min.json'
# Replace with the actual path to your downloaded health data CSV
health_data_path = r'C:\Users\josue\Downloads\PLACES__ZCTA_Data__GIS_Friendly_Format___2024_release_20250612.csv'
output_geojson_path = 'public/ny_new_york_zip_codes_health_data.geojson'

# Read the GeoJSON file
gdf = gpd.read_file(geojson_path)

# Read the health data CSV
health_df = pd.read_csv(health_data_path)

# --- IMPORTANT: Adjust these lines based on your CSV file ---
# Identify the column in your health data CSV that contains the ZCTA code
# It might be named 'ZCTA', 'ZIP', ' مكان', etc.
health_zcta_column = 'ZCTA5'

# Identify the column(s) in your health data CSV that contain the health indicator data you want to use
# You might have one column for a specific indicator (e.g., 'Diabetes_Rate') or multiple.
health_indicator_columns = [
    'DIABETES_CrudePrev',
    'OBESITY_CrudePrev',
    'LPA_CrudePrev',
    'CSMOKING_CrudePrev',
    'BPHIGH_CrudePrev',
    'FOODINSECU_CrudePrev',
    'ACCESS2_CrudePrev'
]
# --- End of IMPORTANT adjustments ---

# Rename the ZCTA code column to 'zip_code' for clarity
gdf = gdf.rename(columns={'ZCTA5CE10': 'zip_code'})

# Ensure ZCTA columns are of the same data type (e.g., string) for merging
gdf['zip_code'] = gdf['zip_code'].astype(str)
health_df[health_zcta_column] = health_df[health_zcta_column].astype(str)

# Merge the GeoDataFrame with the health data DataFrame
# We'll use a left merge to keep all the zip code geometries
merged_gdf = gdf.merge(health_df[[health_zcta_column] + health_indicator_columns],
                       left_on='zip_code',
                       right_on=health_zcta_column,
                       how='left')

# Drop the duplicate ZCTA column from the health data DataFrame after merging
merged_gdf = merged_gdf.drop(columns=[health_zcta_column])


# --- IMPORTANT: Calculate your RiskScore here ---
# This is where you'll define how to calculate a single RiskScore
# based on the health indicator columns you selected.
# For example, a simple approach could be an average or a weighted sum.
# Replace this placeholder with your actual calculation:
merged_gdf['RiskScore'] = merged_gdf['DIABETES_CrudePrev']
# --- End of IMPORTANT adjustments ---


# Convert to GeoJSON
geojson_data = json.loads(merged_gdf.to_json())

# Save the merged GeoJSON to a new file
with open(output_geojson_path, 'w') as f:
    json.dump(geojson_data, f)

print(f"Successfully merged health data and saved to {output_geojson_path}")
