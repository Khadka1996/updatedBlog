'use client'
// pages/index.js (or app/page.js for Next.js 13+ app router)
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('last30days');
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalComments: 0,
    totalLikes: 0,
  });
  const [trafficData, setTrafficData] = useState([]);
  const [topContent, setTopContent] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const formatNumber = (num) => new Intl.NumberFormat().format(num);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);

        // Fetch all blogs (increase limit to cover entire collection)
        const blogsRes = await fetch('/api/blogs?limit=10000');
        const blogsJson = await blogsRes.json();

        const blogs = (blogsJson && blogsJson.data) || [];

        // Compute metrics
        const totalPosts = blogsJson.total || blogs.length;
        const totalViews = blogs.reduce((s, b) => s + (b.viewCount || 0), 0);
        const totalComments = blogs.reduce((s, b) => s + ((b.comments && b.comments.length) || 0), 0);
        const totalLikes = blogs.reduce((s, b) => s + ((b.likes && b.likes.length) || 0), 0);

        // Top content by views
        const sortedByViews = [...blogs].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        const top = sortedByViews.slice(0, 5).map((t) => ({ title: t.title, views: t.viewCount || 0 }));

        // Traffic data - use latest 8 posts' views as a simple trend
        const latest = (await (await fetch('/api/blogs/latest')).json()).data || [];
        const traffic = latest.map((item, i) => ({ week: `Post ${i + 1}`, visitors: item.viewCount || 0, revenue: 0 }));

        // Recent activity - show latest articles
        const recent = latest.map((item) => ({ title: item.title, time: item.createdAt }));

        if (!isMounted) return;

        setMetricsData({ totalPosts, totalViews, totalComments, totalLikes });
        setTopContent(top);
        setTrafficData(traffic);
        setRecentActivity(recent);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => { isMounted = false; };
  }, []);

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
        {/* KPI Cards (real data) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Posts</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatNumber(metricsData.totalPosts)}</dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatNumber(metricsData.totalViews)}</dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Comments</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatNumber(metricsData.totalComments)}</dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Likes</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatNumber(metricsData.totalLikes)}</dd>
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

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="h-80 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {recentActivity.length === 0 && !loading && (
                  <li className="py-3 text-sm text-gray-500">No recent activity</li>
                )}
                {recentActivity.map((act, idx) => (
                  <li key={idx} className="py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-6 w-6 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-600">{idx+1}</div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800 truncate">{act.title}</p>
                        <p className="text-xs text-gray-500">{new Date(act.time).toLocaleString()}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
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