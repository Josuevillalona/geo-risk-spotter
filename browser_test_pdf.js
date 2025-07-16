// Comprehensive PDF Generation Test
// Copy and paste this entire script into the browser console

(async function testPDFGeneration() {
  console.log('🚀 Starting comprehensive PDF generation test...');
  
  // Test data that matches the expected structure
  const testData = {
    title: "Test Evidence Package - Diabetes Risk Analysis",
    areaName: "ZIP Code 10001 (Manhattan)",
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
          description: "High obesity rates (28.3%) correlate strongly with diabetes risk" 
        },
        { 
          factor: "Food Insecurity", 
          correlation: 0.72, 
          description: "Limited access to healthy food increases diabetes risk" 
        },
        { 
          factor: "Physical Inactivity", 
          correlation: 0.68, 
          description: "Low physical activity levels contribute to elevated risk" 
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

  try {
    // Test 1: Check if jsPDF is available
    console.log('📋 Test 1: Checking jsPDF availability...');
    const jsPDF = (await import('jspdf')).default;
    console.log('✅ jsPDF imported successfully:', jsPDF);
    
    // Test 2: Test basic jsPDF functionality
    console.log('📋 Test 2: Testing basic jsPDF functionality...');
    const testDoc = new jsPDF();
    testDoc.text('Test', 10, 10);
    console.log('✅ Basic jsPDF test passed');
    
    // Test 3: Test the PDF generation service import
    console.log('📋 Test 3: Testing PDF service import...');
    const pdfModule = await import('./src/services/pdfGeneration.js');
    console.log('✅ PDF service imported:', pdfModule);
    
    // Test 4: Test the convenience function
    console.log('📋 Test 4: Testing generateEvidencePackagePDF function...');
    const { generateEvidencePackagePDF } = pdfModule;
    console.log('✅ generateEvidencePackagePDF function available:', typeof generateEvidencePackagePDF);
    
    // Test 5: Generate actual PDF
    console.log('📋 Test 5: Generating PDF with test data...');
    console.log('📊 Using test data:', testData);
    
    const pdfResult = await generateEvidencePackagePDF(testData);
    console.log('✅ PDF generated successfully:', pdfResult);
    
    // Test 6: Try to save the PDF
    console.log('📋 Test 6: Attempting to save PDF...');
    const filename = `test-evidence-package-${Date.now()}.pdf`;
    pdfResult.save(filename);
    console.log('✅ PDF save triggered:', filename);
    
    console.log('🎉 All tests passed! PDF generation is working correctly.');
    
    // Return success info
    return {
      success: true,
      message: 'PDF generation test completed successfully',
      filename: filename,
      testData: testData
    };
    
  } catch (error) {
    console.error('❌ PDF generation test failed:', error);
    console.error('📋 Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    // Return failure info
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
})();

// Also make the test data available globally for manual testing
window.testPDFData = {
  title: "Test Evidence Package - Diabetes Risk Analysis",
  areaName: "ZIP Code 10001 (Manhattan)",
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
        description: "High obesity rates (28.3%) correlate strongly with diabetes risk" 
      },
      { 
        factor: "Food Insecurity", 
        correlation: 0.72, 
        description: "Limited access to healthy food increases diabetes risk" 
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

console.log(`
🧪 PDF Generation Test Script Loaded

Available commands:
- The test will run automatically
- Use 'testPDFData' to access sample data
- Check console for detailed progress

If the test fails, check:
1. Network/import errors
2. Data structure issues  
3. jsPDF initialization problems
`);
