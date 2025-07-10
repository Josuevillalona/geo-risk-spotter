# S3 Upload Instructions for RiskPulse: Diabetes

## Step 1: Upload Files to S3
Upload the following files to your S3 bucket:

1. **GeoJSON File** - Upload `public/ny_new_york_zip_codes_geo.min.json` to:
```
https://geo-risk-spotter-geojson.s3.us-east-1.amazonaws.com/ny_new_york_zip_codes_health.geojson
```

2. **Interventions Database** - Upload `interventions-db.json` to:
```
https://geo-risk-spotter-geojson.s3.us-east-1.amazonaws.com/interventions/interventions-db.json
```

## Step 2: AWS CLI Upload Commands
Use these commands to upload the files (requires AWS CLI installed and configured):

```bash
# Upload GeoJSON file
aws s3 cp public/ny_new_york_zip_codes_geo.min.json s3://geo-risk-spotter-geojson/ny_new_york_zip_codes_health.geojson --content-type application/json

# Upload interventions database
aws s3 cp interventions-db.json s3://geo-risk-spotter-geojson/interventions/interventions-db.json --content-type application/json
```

## Step 3: Verify CORS Configuration
Ensure your S3 bucket has the following CORS policy to allow access from your application:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET"],
        "AllowedOrigins": [
            "https://geo-risk-spotter.vercel.app",
            "http://localhost:5173"
        ],
        "ExposeHeaders": []
    }
]
```

## Step 4: Test S3 Access
You can test the files are accessible by visiting:
- https://geo-risk-spotter-geojson.s3.us-east-1.amazonaws.com/ny_new_york_zip_codes_health.geojson
- https://geo-risk-spotter-geojson.s3.us-east-1.amazonaws.com/interventions/interventions-db.json

## Step 5: Local Testing
Once uploaded, test locally with:
```bash
cd backend
uvicorn main:app --reload
```

Then in another terminal:
```bash
npm run dev
```

The intervention system should now be functional!
