'use client';

import React, { useState, useEffect } from 'react';

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7'); // Default to 7 days

  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch analytics data from our API route
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate date range based on selected time range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      const response = await fetch(
        `/api/cloudflare-analytics?since=${formatDate(startDate)}&until=${formatDate(endDate)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data.result);
      } else {
        setError(data.errors?.join(', ') || 'Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Error fetching analytics: ' + err.message);
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and when timeRange changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  // Format numbers
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Format bytes
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Simple bar chart component
  const SimpleBarChart = ({ data, dataKey, title, color }) => {
    if (!data || data.length === 0) {
      return <div className="text-gray-500 py-4">No data available</div>;
    }
    
    const maxValue = Math.max(...data.map(item => item[dataKey]), 0);
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">{title}</h4>
        <div className="flex flex-col gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-16 text-xs text-gray-600">{item.date}</div>
              <div className="flex-1 flex items-center bg-gray-100 rounded h-6 relative">
                <div 
                  className="h-full rounded transition-all duration-300" 
                  style={{ 
                    width: maxValue > 0 ? `${(item[dataKey] / maxValue) * 100}%` : '0%',
                    backgroundColor: color
                  }}
                ></div>
                <div className="absolute right-2 text-xs font-medium text-gray-900">
                  {formatNumber(item[dataKey])}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Country list component
  const CountryList = ({ countries }) => {
    if (!countries || countries.length === 0) {
      return <div className="text-gray-500 py-4">No country data available</div>;
    }
    
    const maxRequests = Math.max(...countries.map(c => c.requests), 0);
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Requests by Country</h4>
        <div className="flex flex-col gap-2">
          {countries.slice(0, 10).map((country, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-20 text-xs text-gray-600 truncate">{country.name}</div>
              <div className="flex-1 flex items-center bg-gray-100 rounded h-6 relative">
                <div 
                  className="h-full rounded transition-all duration-300 bg-blue-500" 
                  style={{ 
                    width: maxRequests > 0 ? `${(country.requests / maxRequests) * 100}%` : '0%'
                  }}
                ></div>
                <div className="absolute right-2 text-xs font-medium text-gray-900">
                  {formatNumber(country.requests)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // World map visualization (simplified)
  const WorldMapVisualization = ({ countries }) => {
    if (!countries || countries.length === 0) {
      return <div className="text-gray-500 py-4">No country data available for map</div>;
    }
    
    // This is a simplified representation - in a real app, you'd use a proper map library
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Traffic Distribution</h4>
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            {countries.slice(0, 6).map((country, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
                <span className="text-sm font-medium">{country.name}</span>
                <span className="text-sm text-gray-600">{formatNumber(country.requests)} requests</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Showing top {Math.min(6, countries.length)} of {countries.length} countries
          </p>
        </div>
      </div>
    );
  };

  // Process data for charts
  const processChartData = (timeseries) => {
    if (!timeseries) return [];
    
    return timeseries.map(entry => ({
      date: new Date(entry.since).toLocaleDateString(),
      requests: entry.requests?.all || 0,
      bandwidth: Math.round((entry.bandwidth?.all || 0) / (1024 * 1024)), // Convert to MB
      threats: entry.threats?.all || 0,
      pageViews: entry.pageViews?.all || 0,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cloudflare Analytics</h1>
            <p className="text-gray-600 mt-2">
              Monitor your website's performance and geographic distribution
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        {analyticsData && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">Total Requests</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {formatNumber(analyticsData.totals?.requests?.all)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">Bandwidth</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatBytes(analyticsData.totals?.bandwidth?.all)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">Threats Blocked</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {formatNumber(analyticsData.totals?.threats?.all)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">Page Views</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {formatNumber(analyticsData.totals?.pageViews?.all)}
                </p>
              </div>
            </div>

            {/* Geographic Distribution - Only show if we have country data */}
            {analyticsData.countries && analyticsData.countries.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
                  <WorldMapVisualization countries={analyticsData.countries} />
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Countries</h3>
                  <CountryList countries={analyticsData.countries} />
                </div>
              </div>
            )}

            {/* Requests Over Time Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Requests Over Time</h3>
              <SimpleBarChart 
                data={processChartData(analyticsData.timeseries)} 
                dataKey="requests" 
                title="Requests by Date"
                color="#3b82f6"
              />
            </div>

            {/* Bandwidth Usage Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bandwidth Usage (MB)</h3>
              <SimpleBarChart 
                data={processChartData(analyticsData.timeseries)} 
                dataKey="bandwidth" 
                title="Bandwidth by Date"
                color="#10b981"
              />
            </div>

            {/* Page Views Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Page Views Over Time</h3>
              <SimpleBarChart 
                data={processChartData(analyticsData.timeseries)} 
                dataKey="pageViews" 
                title="Page Views by Date"
                color="#8b5cf6"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;