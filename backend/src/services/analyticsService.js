const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');

const analyticsClient = new BetaAnalyticsDataClient({
  keyFilename: path.join(__dirname, '../config/google-credentials.json'),
});

const propertyId = process.env.GA_PROPERTY_ID;

const getAnalyticsData = async () => {
  const [response] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
  });

  const rows = response.rows || [];

  return rows.map((row) => ({
    date: row.dimensionValues[0].value,
    sessions: parseInt(row.metricValues[0].value) || 0,
    page_views: parseInt(row.metricValues[1].value) || 0,
    bounce_rate: parseFloat(row.metricValues[2].value) || 0,
    avg_session_duration: parseFloat(row.metricValues[3].value) || 0,
  }));
};

module.exports = { getAnalyticsData };