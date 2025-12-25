import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Grid, Table, TableBody, TableCell, 
  TableHead, TableRow, Chip, Button 
} from '@mui/material';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { analyticsService } from '../../services/api';

// Import Custom CSS
import './FinancialAnalytics.css';

export default function FinancialAnalytics() {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsService.getRevenue();
        setChartData(res.data.stats || []);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    fetchData();
  }, []);

  // Helper to calculate totals
  const totalRevenue = chartData.length > 0 
    ? chartData[chartData.length - 1].cumulative_revenue 
    : 0;

  const bestMonth = chartData.length > 0
    ? chartData.reduce((prev, current) => (+prev.monthly_total > +current.monthly_total) ? prev : current)
    : null;

  return (
    <div className="fa-root">
      <Navbar title="Financial Overview" />
      
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {/* Header with Navigation */}
        <div className="fa-header-container">
          <div>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate('/admin')} 
              sx={{ color: '#64748b', mb: 1, textTransform: 'none', fontWeight: 600 }}
            >
              Back to Dashboard
            </Button>
            <h1 className="fa-title">Revenue Performance</h1>
            <p className="fa-subtitle">Track monthly income, growth trends, and cumulative earnings.</p>
          </div>
        </div>

        <Grid container spacing={3}>
          {/* Main Chart Section */}
          <Grid item xs={12} lg={8}>
            <div className="fa-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="fa-card-title">Revenue Trajectory</h2>
                <Chip icon={<TrendingUpIcon />} label="Real-time Data" color="primary" variant="outlined" size="small" />
              </div>
              
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <ComposedChart data={[...chartData].reverse()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left" 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <YAxis yAxisId="right" orientation="right" hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar 
                      yAxisId="left" 
                      dataKey="monthly_total" 
                      name="Monthly Revenue" 
                      fill="url(#colorBar)" 
                      barSize={30} 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="cumulative_revenue" 
                      name="Cumulative Total" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Grid>

          {/* Key Metrics Section */}
          <Grid item xs={12} lg={4}>
            <div className="fa-card">
              <h2 className="fa-card-title">Key Performance Indicators</h2>
              <div className="fa-metric-container">
                
                {/* Total Revenue Box */}
                <div className="fa-metric-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '50%', color: '#16a34a' }}>
                       <TrendingUpIcon fontSize="small" />
                    </div>
                    <span className="fa-metric-label" style={{ marginBottom: 0 }}>Total Revenue</span>
                  </div>
                  <div className="fa-metric-value green" style={{ marginTop: '12px' }}>
                    ${Number(totalRevenue).toLocaleString()}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    All-time earnings from contracts
                  </p>
                </div>

                {/* Best Month Box */}
                <div className="fa-metric-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ padding: '8px', background: '#e0e7ff', borderRadius: '50%', color: '#4f46e5' }}>
                       <CalendarTodayIcon fontSize="small" />
                    </div>
                    <span className="fa-metric-label" style={{ marginBottom: 0 }}>Best Month</span>
                  </div>
                  <div className="fa-metric-value blue" style={{ marginTop: '12px' }}>
                    {bestMonth ? bestMonth.month : 'N/A'}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Highest revenue: <strong>${bestMonth ? Number(bestMonth.monthly_total).toLocaleString() : 0}</strong>
                  </p>
                </div>

              </div>
            </div>
          </Grid>

          {/* Detailed Table Section */}
          <Grid item xs={12}>
            <div className="fa-card" style={{ padding: 0, overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                 <h2 className="fa-card-title" style={{ marginBottom: 0 }}>Monthly Breakdown</h2>
              </Box>
              
              <div className="fa-table-container">
                <Table>
                  <TableHead className="fa-table-head">
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Monthly Income</TableCell>
                      <TableCell align="right">Cumulative Total</TableCell>
                      <TableCell align="center">Growth (vs Prev Month)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chartData.map((row, index) => {
                      const prev = index > 0 ? chartData[index - 1].monthly_total : 0;
                      const growth = row.monthly_total - prev;
                      const isPositive = growth >= 0;

                      return (
                        <TableRow key={index} className="fa-table-row">
                          <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{row.month}</TableCell>
                          <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                            ${Number(row.monthly_total).toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#059669' }}>
                            ${Number(row.cumulative_revenue).toLocaleString()}
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={index === 0 ? "—" : (isPositive ? `+$${growth.toLocaleString()}` : `-$${Math.abs(growth).toLocaleString()}`)} 
                              size="small" 
                              className={isPositive ? 'fa-growth-positive' : 'fa-growth-negative'}
                              sx={{ borderRadius: '6px', minWidth: '80px' }}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {chartData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                          No transaction data available yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}