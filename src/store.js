import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // State
      selectedArea: null,
      isLoading: false,
      aiSummary: null,
      chatHistory: [],
      savedAnalyses: [],

      // Actions
      setAndAnalyzeArea: (area) => set({ selectedArea: area, isLoading: true, aiSummary: null, chatHistory: [] }),
      setAnalysisComplete: (summary) => set({ isLoading: false, aiSummary: summary }),
      setChatHistory: (history) => set({ chatHistory: history }),
      
      saveCurrentAnalysis: (analysisData = null) => {
        try {
          const { savedAnalyses } = get();
          
          // If no data provided, try to use store state (backward compatibility)
          let selectedArea, aiSummary, chatHistory;
          if (analysisData) {
            ({ selectedArea, aiSummary, chatHistory = [] } = analysisData);
          } else {
            ({ selectedArea, aiSummary, chatHistory } = get());
          }
          
          if (!selectedArea) {
            throw new Error('No area selected to save');
          }
          
          const newAnalysis = {
            zcta_code: selectedArea.properties?.ZCTA5CE10 || selectedArea.properties?.zip_code || null,
            version: 1,
            saved_at: new Date().toISOString(),
            aiSummary: aiSummary || '',
            chatHistory: chatHistory || [],
            rawData: selectedArea.properties || {},
          };
          
          // Check localStorage quota
          const currentData = JSON.stringify([...savedAnalyses, newAnalysis]);
          if (currentData.length > 5000000) { // ~5MB limit
            throw new Error('Storage quota exceeded. Please delete some saved analyses.');
          }
          
          set({ savedAnalyses: [...savedAnalyses, newAnalysis] });
          return true;
          
        } catch (error) {
          console.error('Error saving analysis:', error);          throw error;
        }
      },

      // Delete a saved analysis
      deleteSavedAnalysis: (analysisToDelete) => {
        try {
          const { savedAnalyses } = get();
          const updatedAnalyses = savedAnalyses.filter(
            analysis => !(analysis.zcta_code === analysisToDelete.zcta_code && 
                         analysis.saved_at === analysisToDelete.saved_at)
          );
          set({ savedAnalyses: updatedAnalyses });
          return true;
        } catch (error) {
          console.error('Error deleting analysis:', error);
          throw error;
        }
      },

      // Load a saved analysis (for future use when we migrate to full Zustand)
      loadSavedAnalysis: (analysis) => {
        try {
          // For now, this is a placeholder that could be used 
          // when we fully migrate to Zustand state management
          console.log('Loading analysis:', analysis);
          return analysis;
        } catch (error) {
          console.error('Error loading analysis:', error);
          throw error;
        }
      },
    }),
    {
      name: 'riskpulse-diabetes-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ savedAnalyses: state.savedAnalyses }),
      version: 1,
    }
  )
);
