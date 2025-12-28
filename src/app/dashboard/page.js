'use client'
// pages/index.js (or app/page.js for Next.js 13+ app router)
import { useState } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('last30days');
  
  // Sample data - in a real app this would come from an API
  const metricsData = {
    totalVisitors: { current: 142589, previous: 118322 },
    avgTimeOnSite: { current: 225, previous: 190 }, // in seconds
    bounceRate: { current: 52, previous: 58 },
    revenue: { current: 3842, previous: 2950 }
  };
  
  const trafficData = [
    { week: 'Week 1', visitors: 32000, revenue: 800 },
    { week: 'Week 2', visitors: 28500, revenue: 720 },
    { week: 'Week 3', visitors: 35000, revenue: 920 },
    { week: 'Week 4', visitors: 35500, revenue: 950 },
    { week: 'Week 5', visitors: 40000, revenue: 1100 },
    { week: 'Week 6', visitors: 38000, revenue: 1050 },
    { week: 'Week 7', visitors: 42000, revenue: 1200 },
    { week: 'Week 8', visitors: 45000, revenue: 1300 }
  ];
  
  const topContent = [
    { title: '10 Best Lightweight Tents for Everest Base Camp', views: 28450 },
    { title: 'How to Layer Clothes for Extreme Cold Weather', views: 22100 },
    { title: 'Winter Hiking Boots Review 2024', views: 18955 },
    { title: 'Essential Gear for High-Altitude Trekking', views: 15620 },
    { title: 'Acclimatization Strategies for Mountaineers', views: 13200 }
  ];
  
  const trafficSources = [
    { source: 'Organic Search', percentage: 45, color: 'bg-blue-500' },
    { source: 'Social Media', percentage: 30, color: 'bg-green-500' },
    { source: 'Direct', percentage: 15, color: 'bg-yellow-500' },
    { source: 'Email Newsletter', percentage: 10, color: 'bg-purple-500' }
  ];

  const calculateChange = (current, previous) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>EverestKit Blog Dashboard</title>
        <meta name="description" content="Dashboard for EverestKit blog analytics" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">EverestKit  Dashboard</h1>
          <div className="flex items-center space-x-4">
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="custom">Custom Range</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
              Refresh Data
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Visitors Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Visitors</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {formatNumber(metricsData.totalVisitors.current)}
              </dd>
              <div className={`mt-1 text-sm ${metricsData.totalVisitors.current >= metricsData.totalVisitors.previous ? 'text-green-600' : 'text-red-600'}`}>
                {calculateChange(metricsData.totalVisitors.current, metricsData.totalVisitors.previous) > 0 ? '↑' : '↓'} 
                {calculateChange(metricsData.totalVisitors.current, metricsData.totalVisitors.previous)}% from previous period
              </div>
            </div>
          </div>

          {/* Avg Time on Site Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Avg. Time on Site</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {formatTime(metricsData.avgTimeOnSite.current)}
              </dd>
              <div className={`mt-1 text-sm ${metricsData.avgTimeOnSite.current >= metricsData.avgTimeOnSite.previous ? 'text-green-600' : 'text-red-600'}`}>
                {calculateChange(metricsData.avgTimeOnSite.current, metricsData.avgTimeOnSite.previous) > 0 ? '↑' : '↓'} 
                {calculateChange(metricsData.avgTimeOnSite.current, metricsData.avgTimeOnSite.previous)}% from previous period
              </div>
            </div>
          </div>

          {/* Bounce Rate Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Bounce Rate</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {metricsData.bounceRate.current}%
              </dd>
              <div className={`mt-1 text-sm ${metricsData.bounceRate.current <= metricsData.bounceRate.previous ? 'text-green-600' : 'text-red-600'}`}>
                {calculateChange(metricsData.bounceRate.current, metricsData.bounceRate.previous) > 0 ? '↑' : '↓'} 
                {Math.abs(calculateChange(metricsData.bounceRate.current, metricsData.bounceRate.previous))}% from previous period
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Revenue</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ${formatNumber(metricsData.revenue.current)}
              </dd>
              <div className={`mt-1 text-sm ${metricsData.revenue.current >= metricsData.revenue.previous ? 'text-green-600' : 'text-red-600'}`}>
                {calculateChange(metricsData.revenue.current, metricsData.revenue.previous) > 0 ? '↑' : '↓'} 
                {calculateChange(metricsData.revenue.current, metricsData.revenue.previous)}% from previous period
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Traffic and Revenue Chart */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Weekly Visitors & Revenue Trend</h2>
            <div className="h-80">
              {/* This would be a chart component in a real app */}
              <div className="flex items-end justify-between h-64 mt-4">
                {trafficData.map((week, index) => (
                  <div key={index} className="flex flex-col items-center w-1/8">
                    <div className="relative h-40 w-full flex items-end justify-center">
                      <div 
                        className="w-3/4 bg-blue-200 rounded-t"
                        style={{ height: `${(week.visitors / 50000) * 100}%` }}
                      ></div>
                      <div 
                        className="w-1/4 bg-green-300 rounded-t absolute bottom-0"
                        style={{ height: `${(week.revenue / 1500) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 truncate">{week.week}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-200 mr-2"></div>
                  <span className="text-sm text-gray-600">Visitors</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-300 mr-2"></div>
                  <span className="text-sm text-gray-600">Revenue ($)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Sources Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Traffic Sources</h2>
            <div className="h-80">
              {/* This would be a chart component in a real app */}
              <div className="flex flex-col space-y-4 mt-4">
                {trafficSources.map((source, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{source.source}</span>
                      <span className="text-sm text-gray-700">{source.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${source.color} h-2.5 rounded-full`} 
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Content */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Top Performing Content</h2>
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {topContent.map((content, index) => (
                  <li key={index} className="py-4">
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {content.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatNumber(content.views)} views
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                <li className="py-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 h-5 w-5 text-yellow-500">📈</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">Winter Hiking Boots Review</span> is trending with 50% more traffic
                      </p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 h-5 w-5 text-red-500">⚠️</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800">
                        Website load time <span className="font-medium">increased by 0.8s</span>
                      </p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">🔗</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800">
                        New backlink from <span className="font-medium">outdoorgearlovers.com</span>
                      </p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                View All Activity
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}