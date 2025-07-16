/**
 * PDF Generation Test
 * Tests the PDF generation functionality with sample data
 */

// Test data structure that matches what the PDF service expects
const testPackageData = {
  title: "Test Evidence Package - Diabetes Risk Analysis",
  areaName: "ZIP Code 10001",
  metrics: {
    riskScore: 15.2,
    diabetes: 12.5,
    obesity: 28.3,
    hypertension: 35.7,
    physicalActivity: 75.2,
    smoking: 18.5,
    foodInsecurity: 22.1,
    healthcareAccess: 85.3,
    population: 45000
  },
  analysis: {
    topFactors: [
      { 
        factor: "Obesity Rate", 
        correlation: 0.85, 
        description: "High obesity rates (28.3%) correlate strongly with diabetes risk in this area" 
      },
      { 
        factor: "Physical Inactivity", 
        correlation: 0.72, 
        description: "Low physical activity levels contribute to elevated diabetes risk" 
      },
      { 
        factor: "Food Insecurity", 
        correlation: 0.68, 
        description: "Limited access to healthy food options increases diabetes risk" 
      }
    ]
  },
  sections: {
    executiveSummary: true,
    riskAssessment: true,
    rootCauseAnalysis: true,
    recommendedActions: true,
    supportingData: true,
    methodology: false,
    appendices: false
  },
  customSections: [],
  metadata: {
    generatedAt: new Date().toISOString(),
    estimatedPages: 12,
    confidentialityLevel: 'public',
    dataSource: 'NYC Department of Health and Mental Hygiene',
    analysisConfidence: 'high'
  }
};

// Test function for browser console
const testPDFGeneration = async () => {
  try {
    console.log('🧪 Starting PDF Generation Test...');
    console.log('📊 Test data:', testPackageData);
    
    // Import the PDF service
    const { generateEvidencePackagePDF } = await import('./src/services/pdfGeneration.js');
    
    console.log('✅ PDF service imported successfully');
    
    // Generate PDF
    console.log('🔄 Generating PDF...');
    const pdfDoc = await generateEvidencePackagePDF(testPackageData);
    
    console.log('✅ PDF generated successfully!');
    console.log('📄 PDF document:', pdfDoc);
    
    // Save the PDF
    const filename = `test-evidence-package-${Date.now()}.pdf`;
    pdfDoc.save(filename);
    
    console.log(`💾 PDF saved as: ${filename}`);
    console.log('🎉 Test completed successfully!');
    
    return true;
    
  } catch (error) {
    console.error('❌ PDF generation test failed:', error);
    console.error('📋 Error details:', {
      message: error.message,
      stack: error.stack
    });
    return false;
  }
};

// Export for use in other contexts
if (typeof window !== 'undefined') {
  window.testPDFGeneration = testPDFGeneration;
  window.testPackageData = testPackageData;
}

// Instructions for testing
console.log(`
🚀 PDF Generation Test Ready!

To test the PDF generation:
1. Open browser console
2. Run: testPDFGeneration()
3. Check for success/error messages
4. Look for downloaded PDF file

Test data is available as: testPackageData
`);
