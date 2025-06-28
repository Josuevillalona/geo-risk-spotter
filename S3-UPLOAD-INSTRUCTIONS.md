# S3 Upload Instructions for Intervention Database

## Step 1: Upload to S3
Upload the `interventions-db.json` file to your S3 bucket with the following path:
```
https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/interventions/interventions-db.json
```

## Step 2: Verify CORS Configuration
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

## Step 3: Test S3 Access
You can test the file is accessible by visiting:
https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/interventions/interventions-db.json

## Step 4: Local Testing
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
