import geopandas as gpd
import pandas as pd
import json

# Path to the minified GeoJSON file
geojson_path = 'public/ny_new_york_zip_codes_geo.min.json'
# Path to the health data CSV file
health_data_path = 'C:/Users/josue/Downloads/PLACES__ZCTA_Data__GIS_Friendly_Format___2024_release_20250612.csv'
# Output path for the new GeoJSON file with health data
output_geojson_path = 'public/ny_new_york_zip_codes_health.geojson'

# Read the minified GeoJSON file
gdf = gpd.read_file(geojson_path)

# Read the health data CSV file
health_df = pd.read_csv(health_data_path)

# Ensure the ZCTA columns are of the same type (e.g., string) for merging
gdf['ZCTA5CE10'] = gdf['ZCTA5CE10'].astype(str)
health_df['ZCTA5'] = health_df['ZCTA5'].astype(str)

# Merge the GeoDataFrame with the health data DataFrame
# Use a left merge to keep all geometries from the GeoJSON
merged_gdf = gdf.merge(health_df, left_on='ZCTA5CE10', right_on='ZCTA5', how='left')

# Define the weights for the RiskScore calculation
weights = {
    'DIABETES_CrudePrev': 0.20,
    'OBESITY_CrudePrev': 0.15,
    'BPHIGH_CrudePrev': 0.15,
    'CSMOKING_CrudePrev': 0.20,
    'LPA_CrudePrev': 0.10,
    'FOODINSECU_CrudePrev': 0.10,
    'ACCESS2_CrudePrev': 0.10,
}

# Calculate the RiskScore
# Fill NaN values with 0 before calculation to avoid errors
for col in weights.keys():
    merged_gdf[col] = merged_gdf[col].fillna(0)

merged_gdf['RiskScore'] = sum(merged_gdf[col] * weights[col] for col in weights.keys())

# Select relevant columns for the output GeoJSON
# Keep geometry, original ZCTA code, and the new RiskScore
output_gdf = merged_gdf[['geometry', 'ZCTA5CE10', 'RiskScore']]

# Rename the ZCTA code column to 'zip_code' for clarity in the frontend
output_gdf = output_gdf.rename(columns={'ZCTA5CE10': 'zip_code'})

# Save the updated GeoDataFrame to a new GeoJSON file in the public directory
output_gdf.to_file(output_geojson_path, driver='GeoJSON')

print(f"Successfully created GeoJSON with health data: {output_geojson_path}")
