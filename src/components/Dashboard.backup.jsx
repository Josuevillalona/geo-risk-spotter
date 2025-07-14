import React, { useState } from "react";
import Map from "../Map";
import Sidebar from "../Sidebar";
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdAutoAwesome, MdClose } from "react-icons/md";

// Import our enhanced design system components
import { Card, Typography, Button } from './design-system/index.jsx';
import { 
  MapLegend, 
  RiskMetricsDashboard, 
  AreaInfoPanel, 
  SidebarToggle 
} from './dashboard/index.jsx';

const Dashboard = ({ mapProps, sidebarProps }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showMetrics, setShowMetrics] = useState(true);

  // Sample data for metrics dashboard (in real app, this would come from props/state)
  const metricsData = {
    populationAtRisk: "127K",
    avgRiskScore: "6.8", 
    hotSpots: "23",
    priorityZones: "7"
  };

  return (
    <div className="relative h-screen w-full bg-gray-50 overflow-hidden">
      {/* Enhanced Metrics Dashboard (collapsible) */}
      {showMetrics && (
        <div className="absolute top-4 left-4 right-20 z-[1100]">
          <Card className="bg-white/95 backdrop-blur-sm border shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary-600" />
                  <Typography variant="h2" className="text-gray-900">
                    RiskPulse: Diabetes Dashboard
                  </Typography>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMetrics(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MdClose className="w-4 h-4" />
                </Button>
              </div>
              <RiskMetricsDashboard data={metricsData} />
            </div>
          </Card>
        </div>
      )}

      {/* Metrics Toggle (when collapsed) */}
      {!showMetrics && (
        <Button
          onClick={() => setShowMetrics(true)}
          className="absolute top-4 left-4 z-[1100] bg-white/95 backdrop-blur-sm border shadow-lg"
          variant="secondary"
        >
          <FaMapMarkerAlt className="w-4 h-4 mr-2" />
          Show Dashboard
        </Button>
      )}

      {/* Main Map Container */}
      <div className="h-full w-full relative">
        <Map 
          {...mapProps} 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onAreaSelect={setSelectedArea}
        />
        
        {/* Enhanced Map Legend */}
        <MapLegend isExpanded={true} />

        {/* Area Information Panel */}
        <AreaInfoPanel 
          selectedArea={selectedArea}
          onClose={() => setSelectedArea(null)}
        />

        {/* Enhanced Sidebar Toggle */}
        <SidebarToggle 
          isOpen={sidebarOpen}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* Enhanced AI Insights Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-96 z-[1300]
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <Card className="h-full rounded-none border-l shadow-2xl bg-white">
          <div className="flex flex-col h-full">
            {/* Enhanced Sidebar Header */}
            <div className="p-4 border-b bg-gradient-to-r from-primary-50 to-primary-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500 rounded-lg">
                    <MdAutoAwesome className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Typography variant="h3" className="text-gray-900">
                      AI Insights
                    </Typography>
                    <Typography className="text-sm text-gray-600">
                      Powered by advanced analytics
                    </Typography>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MdClose className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto p-4">
                <Sidebar {...sidebarProps} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[1200]"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
