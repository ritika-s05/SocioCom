const { getAnalyticsData } = require('../services/analyticsService');
const supabase = require('../config/supabase');

const fetchAnalytics = async (req, res, next) => {
  try {
    const data = await getAnalyticsData();
    res.status(200).json({
      status: 'ok',
      count: data.length,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

const syncAnalytics = async (req, res, next) => {
  try {
    const data = await getAnalyticsData();

    const { error } = await supabase
      .from('analytics_snapshots')
      .upsert(data, { onConflict: 'date' });

    if (error) throw error;

    res.status(200).json({
      status: 'ok',
      message: `Synced ${data.length} days of analytics to database`,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { fetchAnalytics, syncAnalytics };