#!/usr/bin/env python3
"""
Convert NYC Borough Boundaries shapefile to GeoJSON
"""

import geopandas as gpd
import json
import os

def convert_shapefile_to_geojson():
    """Convert the NYC borough boundaries shapefile to GeoJSON format"""
    
    # Input shapefile path
    shapefile_path = "nybb_25b/nybb.shp"
    
    # Output GeoJSON path
    output_path = "public/nyc_borough_boundaries.geojson"
    
    try:
        # Read the shapefile
        print(f"Reading shapefile: {shapefile_path}")
        gdf = gpd.read_file(shapefile_path)
        
        # Display basic info about the data
        print(f"Found {len(gdf)} borough boundaries")
        print(f"Columns: {list(gdf.columns)}")
        print(f"CRS: {gdf.crs}")
        
        # Display the first few rows to understand the data structure
        print("\nFirst few rows:")
        print(gdf.head())
        
        # Ensure we're using WGS84 (EPSG:4326) for web mapping
        if gdf.crs.to_epsg() != 4326:
            print(f"Converting from {gdf.crs} to WGS84 (EPSG:4326)")
            gdf = gdf.to_crs(epsg=4326)
        
        # Clean up the data - standardize column names
        # Common column names in NYC borough data: BoroName, BoroCode, etc.
        column_mapping = {}
        for col in gdf.columns:
            if col.lower() in ['boroname', 'boro_name', 'borough_name', 'name']:
                column_mapping[col] = 'borough_name'
            elif col.lower() in ['borocode', 'boro_code', 'borough_code', 'code']:
                column_mapping[col] = 'borough_code'
        
        if column_mapping:
            gdf = gdf.rename(columns=column_mapping)
            print(f"Renamed columns: {column_mapping}")
        
        # Create the public directory if it doesn't exist
        os.makedirs("public", exist_ok=True)
        
        # Save to GeoJSON
        print(f"Saving to: {output_path}")
        gdf.to_file(output_path, driver='GeoJSON')
        
        # Also save a pretty-printed version for inspection
        with open(output_path, 'r') as f:
            geojson_data = json.load(f)
        
        with open(output_path.replace('.geojson', '_pretty.geojson'), 'w') as f:
            json.dump(geojson_data, f, indent=2)
        
        print(f"✅ Successfully converted shapefile to GeoJSON!")
        print(f"✅ Output: {output_path}")
        print(f"✅ Pretty version: {output_path.replace('.geojson', '_pretty.geojson')}")
        
        # Display borough names found
        if 'borough_name' in gdf.columns:
            print(f"\nBorough names found: {gdf['borough_name'].tolist()}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error converting shapefile: {e}")
        return False

if __name__ == "__main__":
    convert_shapefile_to_geojson()
