# PowerShell script to upload GeoJSON file to S3
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

# Check if local file exists
$localFile = "public/ny_new_york_zip_codes_geo.min.json"
if (Test-Path $localFile) {
    $fileSize = (Get-Item $localFile).Length
    Write-Host "✅ Local file found: $localFile ($([math]::Round($fileSize/1MB, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "❌ Local file not found: $localFile" -ForegroundColor Red
    exit 1
}

# S3 bucket and path
$bucketName = "geo-risk-spotter-geojson"
$s3Path = "s3://$bucketName/ny_new_york_zip_codes_health.geojson"

Write-Host "`n🔄 Uploading to S3..." -ForegroundColor Yellow
Write-Host "Source: $localFile" -ForegroundColor Cyan
Write-Host "Destination: $s3Path" -ForegroundColor Cyan

# Upload with proper content-type
try {
    aws s3 cp $localFile $s3Path --content-type "application/json"
    Write-Host "✅ Upload successful!" -ForegroundColor Green
    
    # Verify upload
    Write-Host "`n🔍 Verifying upload..." -ForegroundColor Yellow
    $s3Size = aws s3 ls $s3Path --summarize | Select-String "Total Size"
    Write-Host "S3 file info: $s3Size" -ForegroundColor Cyan
    
    Write-Host "`n🌐 File accessible at:" -ForegroundColor Green
    Write-Host "https://$bucketName.s3.us-east-1.amazonaws.com/ny_new_york_zip_codes_health.geojson" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Upload failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Upload complete! Don't forget to configure CORS on your S3 bucket." -ForegroundColor Green
Write-Host "See S3-UPLOAD-INSTRUCTIONS.md for CORS configuration details." -ForegroundColor Yellow
