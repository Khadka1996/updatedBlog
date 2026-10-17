// app/api/cloudflare-analytics/route.js
import { NextResponse } from 'next/server';

import { API_URL } from '@/config/site';

// Only signed-in admins/moderators may read analytics. The backend owns the
// session logic, so ask it who the caller is (forwarding their cookie).
async function isStaff(request) {
  const backend = (process.env.API_PROXY_TARGET || API_URL).replace(/\/$/, '');
  try {
    const res = await fetch(`${backend}/api/users/me`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
        'user-agent': request.headers.get('user-agent') || '',
      },
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const json = await res.json();
    return ['admin', 'moderator'].includes(json?.data?.user?.role);
  } catch {
    return false;
  }
}

export async function GET(request) {
  if (!(await isStaff(request))) {
    return NextResponse.json({ success: false, errors: ['Authentication required'] }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get('since');
  const until = searchParams.get('until');

  // Cloudflare API credentials — set in the frontend .env, never in code.
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const authEmail = process.env.CLOUDFLARE_AUTH_EMAIL;
  const authKey = process.env.CLOUDFLARE_AUTH_KEY;
  if (!zoneId || !authEmail || !authKey) {
    return NextResponse.json(
      { success: false, errors: ['Cloudflare analytics is not configured (CLOUDFLARE_ZONE_ID / CLOUDFLARE_AUTH_EMAIL / CLOUDFLARE_AUTH_KEY)'] },
      { status: 503 }
    );
  }

  try {
    // Use provided dates or default to last 7 days
    const endDate = until ? new Date(until) : new Date();
    const startDate = since ? new Date(since) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Format dates as YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const querySince = formatDate(startDate);
    const queryUntil = formatDate(endDate);

    // GraphQL query for time series data
    const timeSeriesQuery = `
      query {
        viewer {
          zones(filter: { zoneTag: "${zoneId}" }) {
            httpRequests1dGroups(
              limit: 100,
              orderBy: [date_ASC],
              filter: {
                date_geq: "${querySince}",
                date_leq: "${queryUntil}"
              }
            ) {
              dimensions {
                date
              }
              sum {
                requests
                bytes
                pageViews
                threats
              }
            }
          }
        }
      }
    `;

    // GraphQL query for country data - using correct field names
    // Let's try multiple approaches to get country data
    const countryQueries = [
      // Try with httpRequestsAdaptiveGroups first
      `
      query {
        viewer {
          zones(filter: { zoneTag: "${zoneId}" }) {
            httpRequestsAdaptiveGroups(
              limit: 100,
              orderBy: [sum_requests_DESC],
              filter: {
                date_geq: "${querySince}",
                date_leq: "${queryUntil}"
              }
            ) {
              dimensions {
                clientCountryName
              }
              sum {
                requests
              }
            }
          }
        }
      }
      `,
      // Try with zoneLoads (classic analytics)
      `
      query {
        viewer {
          zones(filter: { zoneTag: "${zoneId}" }) {
            zoneLoads {
              countryMap {
                clientCountryName
                requests
              }
            }
          }
        }
      }
      `,
      // Try with different field names
      `
      query {
        viewer {
          zones(filter: { zoneTag: "${zoneId}" }) {
            httpRequests1hGroups(
              limit: 100,
              orderBy: [sum_requests_DESC],
              filter: {
                date_geq: "${querySince}",
                date_leq: "${queryUntil}"
              }
            ) {
              dimensions {
                country
              }
              sum {
                requests
              }
            }
          }
        }
      }
      `
    ];

    // Execute time series query
    const timeSeriesResponse = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'X-Auth-Email': authEmail,
        'X-Auth-Key': authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: timeSeriesQuery }),
    });

    if (!timeSeriesResponse.ok) {
      throw new Error(`HTTP error! status: ${timeSeriesResponse.status}`);
    }

    const timeSeriesData = await timeSeriesResponse.json();
    
    if (timeSeriesData.errors) {
      console.error('Time series errors:', timeSeriesData.errors);
    }

    // Try each country query until one works
    let countryData = null;
    for (let i = 0; i < countryQueries.length; i++) {
      try {
        const countryResponse = await fetch('https://api.cloudflare.com/client/v4/graphql', {
          method: 'POST',
          headers: {
            'X-Auth-Email': authEmail,
            'X-Auth-Key': authKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: countryQueries[i] }),
        });

        if (countryResponse.ok) {
          const data = await countryResponse.json();
          if (!data.errors) {
            countryData = data;
            console.log(`Country query ${i} succeeded`);
            break;
          } else {
            console.log(`Country query ${i} failed:`, data.errors);
          }
        }
      } catch (err) {
        console.error(`Country query ${i} failed:`, err);
        // Continue to next query
      }
    }

    // If all country queries failed, let's try the classic API
    if (!countryData) {
      try {
        console.log('Trying classic API for country data');
        const classicResponse = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/analytics/dashboard?since=${querySince}&until=${queryUntil}`,
          {
            headers: {
              'X-Auth-Email': authEmail,
              'X-Auth-Key': authKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (classicResponse.ok) {
          const classicData = await classicResponse.json();
          if (classicData.success && classicData.result && classicData.result.totals && classicData.result.totals.country) {
            // Transform classic API data to match our format
            countryData = {
              data: {
                viewer: {
                  zones: [{
                    classicCountryData: classicData.result.totals.country
                  }]
                }
              }
            };
          }
        }
      } catch (err) {
        console.error('Classic API also failed:', err);
      }
    }
    
    // Transform the GraphQL responses
    const result = {
      ...transformTimeSeriesData(timeSeriesData.data),
      ...transformCountryData(countryData ? countryData.data : null)
    };
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error fetching Cloudflare analytics:', error);
    return NextResponse.json(
      { success: false, errors: [error.message] },
      { status: 500 }
    );
  }
}

// Transform time series data
function transformTimeSeriesData(data) {
  if (!data || !data.viewer || !data.viewer.zones || data.viewer.zones.length === 0) {
    return { timeseries: [], totals: {} };
  }
  
  const groups = data.viewer.zones[0].httpRequests1dGroups;
  
  // Transform timeseries data
  const timeseries = groups.map(group => ({
    since: group.dimensions.date + 'T00:00:00Z',
    until: group.dimensions.date + 'T23:59:59Z',
    requests: { all: group.sum.requests || 0 },
    bandwidth: { all: group.sum.bytes || 0 },
    pageViews: { all: group.sum.pageViews || 0 },
    threats: { all: group.sum.threats || 0 }
  }));
  
  // Calculate totals
  const totals = {
    requests: { all: timeseries.reduce((sum, day) => sum + day.requests.all, 0) },
    bandwidth: { all: timeseries.reduce((sum, day) => sum + day.bandwidth.all, 0) },
    pageViews: { all: timeseries.reduce((sum, day) => sum + day.pageViews.all, 0) },
    threats: { all: timeseries.reduce((sum, day) => sum + day.threats.all, 0) },
  };
  
  return {
    timeseries,
    totals
  };
}

// Transform country data
function transformCountryData(data) {
  // If no country data is available, return empty array
  if (!data || !data.viewer || !data.viewer.zones || data.viewer.zones.length === 0) {
    return { countries: [] };
  }
  
  let countries = [];
  const zoneData = data.viewer.zones[0];
  
  // Try different data structures
  if (zoneData.httpRequestsAdaptiveGroups) {
    // GraphQL adaptive groups format
    const groups = zoneData.httpRequestsAdaptiveGroups;
    const countryMap = {};
    groups.forEach(group => {
      const country = group.dimensions.clientCountryName || 'Unknown';
      if (!countryMap[country]) {
        countryMap[country] = 0;
      }
      countryMap[country] += group.sum.requests || 0;
    });
    
    countries = Object.entries(countryMap)
      .map(([name, requests]) => ({ name, requests }))
      .sort((a, b) => b.requests - a.requests);
  } 
  else if (zoneData.classicCountryData) {
    // Classic API format
    countries = Object.entries(zoneData.classicCountryData)
      .map(([name, requests]) => ({ name, requests }))
      .sort((a, b) => b.requests - a.requests);
  }
  else if (zoneData.httpRequests1hGroups && zoneData.httpRequests1hGroups[0] && zoneData.httpRequests1hGroups[0].dimensions.country) {
    // Alternative GraphQL format
    const groups = zoneData.httpRequests1hGroups;
    const countryMap = {};
    groups.forEach(group => {
      const country = group.dimensions.country || 'Unknown';
      if (!countryMap[country]) {
        countryMap[country] = 0;
      }
      countryMap[country] += group.sum.requests || 0;
    });
    
    countries = Object.entries(countryMap)
      .map(([name, requests]) => ({ name, requests }))
      .sort((a, b) => b.requests - a.requests);
  }
  else if (zoneData.zoneLoads && zoneData.zoneLoads.countryMap) {
    // Zone loads format
    countries = zoneData.zoneLoads.countryMap
      .map(item => ({ name: item.clientCountryName, requests: item.requests }))
      .sort((a, b) => b.requests - a.requests);
  }
  
  return { countries };
}