import geopandas as gpd
import pandas as pd
import json

# Replace with the actual path to your downloaded shapefile
shapefile_path = 'C:/Users/josue/Downloads/tl_2023_us_zcta520/tl_2023_us_zcta520.shp'
output_geojson_path = 'shapes.geojson'

# Read the shapefile
gdf = gpd.read_file(shapefile_path)
print(gdf.columns)


# Select only the geometry and ZCTA code columns
# You may need to adjust the column name 'ZCTA5CE10' based on your shapefile's attribute table
gdf = gdf[['geometry', 'ZCTA5CE20']]

# Rename the ZCTA code column to 'zip_code' for clarity
gdf = gdf.rename(columns={'ZCTA5CE20': 'zip_code'})

# Convert to GeoJSON
geojson_data = json.loads(gdf.to_json())

# Save the GeoJSON to a file
with open(output_geojson_path, 'w') as f:
   json.dump(geojson_data, f)

print(f"Successfully converted shapefile to {output_geojson_path}")
