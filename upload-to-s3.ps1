# PowerShell script to upload GeoJSON files to S3
# Requirements: AWS CLI installed and configured

Write-Host "🚀 RiskPulse: Diabetes S3 Upload Script" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version
    Write-Host "✅ AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    Write-Host "Download from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# S3 bucket name
$bucketName = "geo-risk-spotter-geojson"

# Function to upload file to S3
function Upload-FileToS3 {
    param(
        [string]$LocalFile,
        [string]$S3Key,
        [string]$Description
    )
    
    if (Test-Path $LocalFile) {
        $fileSize = (Get-Item $LocalFile).Length
        Write-Host "✅ $Description found: $LocalFile ($([math]::Round($fileSize/1MB, 2)) MB)" -ForegroundColor Green
        
        $s3Path = "s3://$bucketName/$S3Key"
        
        Write-Host "`n🔄 Uploading $Description to S3..." -ForegroundColor Yellow
        Write-Host "Source: $LocalFile" -ForegroundColor Cyan
        Write-Host "Destination: $s3Path" -ForegroundColor Cyan
        
        try {
            aws s3 cp $LocalFile $s3Path --content-type "application/json"
            Write-Host "✅ $Description upload successful!" -ForegroundColor Green
            
            Write-Host "🌐 File accessible at:" -ForegroundColor Green
            Write-Host "https://$bucketName.s3.us-east-1.amazonaws.com/$S3Key" -ForegroundColor Cyan
            
        } catch {
            Write-Host "❌ $Description upload failed: $_" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "❌ $Description not found: $LocalFile" -ForegroundColor Red
        return $false
    }
    return $true
}

# Upload zip code health data
$success1 = Upload-FileToS3 -LocalFile "public/ny_new_york_zip_codes_geo.min.json" -S3Key "ny_new_york_zip_codes_health.geojson" -Description "Zip Code Health Data"

# Upload borough boundaries
$success2 = Upload-FileToS3 -LocalFile "public/nyc_borough_boundaries.geojson" -S3Key "nyc_borough_boundaries.geojson" -Description "Borough Boundaries"

Write-Host "`n📊 Upload Summary:" -ForegroundColor Yellow
if ($success1) {
    Write-Host "✅ Zip Code Health Data uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Zip Code Health Data upload failed" -ForegroundColor Red
}

if ($success2) {
    Write-Host "✅ Borough Boundaries uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Borough Boundaries upload failed" -ForegroundColor Red
}

if ($success1 -and $success2) {
    Write-Host "`n🎉 All files uploaded successfully!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some uploads failed. Check errors above." -ForegroundColor Yellow
}

Write-Host "`n✅ Upload complete! Don't forget to configure CORS on your S3 bucket." -ForegroundColor Green
Write-Host "See S3-UPLOAD-INSTRUCTIONS.md for CORS configuration details." -ForegroundColor Yellow
