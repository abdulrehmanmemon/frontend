import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Charts from './Charts';
import RevenueDashboard from '../dashboards/revenue/RevenueDashboard.jsx';
import DealDashboard from '../dashboards/deals/DealDashboard.jsx';
import RetentionDashboard from '../dashboards/retention/RetentionDashboard.jsx';
import SegmentDashboard from '../dashboards/segments/SegmentDashboard.jsx';

export default function Home() {
  const [activeTab, setActiveTab] = useState('Revenue');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const renderTabContent = () => {
    if (activeTab === 'Revenue') {
      return (
        <div className="mt-4">
          <RevenueDashboard />
        </div>
      );
    } else if (activeTab === 'Deals') {
      return (
        <div className="mt-4">
          <DealDashboard />
        </div>
      );
    } else if (activeTab === 'Retention') {
      return (
        <div className="mt-4">
          <RetentionDashboard />
        </div>
      );
    } else if (activeTab === 'Segments') {
      return (
        <div className="mt-4">
          <SegmentDashboard />
        </div>
      );
    }

    const parsedQuery = JSON.parse(queries[activeTab]);

    return (
      <>
        <div className="mt-4 w-full">{renderInsights()}</div>
        <div className="mt-4 w-1/2">
          <Charts
            query={{
              dimensions: parsedQuery.dimensions,
              filters: parsedQuery.filters,
              measures: parsedQuery.measures,
              total: parsedQuery.total || false,
            }}
            pivotConfig={parsedQuery.pivotConfig}
            chartType={parsedQuery.chartType}
          />
        </div>
      </>
    );
  };

  const handleChatbotClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate('/chatbot');
    }, 1000);
  };

  return (
    <section className="w-full h-full bg-gray-100">
      {/* Left Panel */}

        {/* Tabs */}
        <div className="flex space-x-2 p-2 bg-gray-100">
          {['Revenue', 'Deals', 'Retention', 'Segments'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="w-full h-full">{renderTabContent()}</div>
    </section>
  );
}