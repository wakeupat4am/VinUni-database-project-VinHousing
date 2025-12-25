const pool = require('../config/database');

// 1. GROUP BY Example: New Users Registered per Month
const getUserGrowthStats = async (req, res, next) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month, 
        COUNT(*) as new_users
      FROM users
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);
    res.json({ stats });
  } catch (error) { next(error); }
};

// 2. WINDOW FUNCTION Example: Cumulative Contract Revenue over Time
const getRevenueAnalytics = async (req, res, next) => {
  try {
    const [stats] = await pool.query(`
      WITH MonthlyRevenue AS (
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          SUM(rent) as monthly_total
        FROM contracts
        WHERE status IN ('active', 'terminated', 'signed')
        GROUP BY month
      )
      SELECT 
        month,
        monthly_total,
        -- ✅ WINDOW FUNCTION: Calculates Running Total (Cumulative)
        SUM(monthly_total) OVER (ORDER BY month) as cumulative_revenue,
        -- ✅ WINDOW FUNCTION: Calculate Month-over-Month Growth
        LAG(monthly_total) OVER (ORDER BY month) as previous_month_revenue
      FROM MonthlyRevenue
      ORDER BY month DESC
    `);
    
    res.json({ stats });
  } catch (error) { next(error); }
};

// 3. GROUP BY + ROLLUP Example: Issues by Category with Total
const getIssueStats = async (req, res, next) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COALESCE(category, 'TOTAL') as category, 
        COUNT(*) as count 
      FROM issue_reports 
      GROUP BY category WITH ROLLUP
    `);
    res.json({ stats });
  } catch (error) { next(error); }
};

module.exports = {
  getUserGrowthStats,
  getRevenueAnalytics,
  getIssueStats
};