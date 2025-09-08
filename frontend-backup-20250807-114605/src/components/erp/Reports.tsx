import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Refresh,
  CalendarToday,
  Business,
  AttachMoney,
  Inventory,
  Assignment
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { erpApi } from '@/services/erp';

interface ReportData {
  period: {
    start: string;
    end: string;
  };
  summary: {
    [key: string]: any;
  };
  [key: string]: any;
}

interface DashboardMetrics {
  revenue_trend: {
    sales: Array<{ date: string; revenue: number }>;
    service: Array<{ date: string; revenue: number }>;
  };
  top_performers: Array<{
    assignee__username: string;
    tasks_count: number;
    completed_count: number;
  }>;
  recent_activities: Array<{
    type: string;
    title: string;
    description: string;
    date: string;
    company: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('sales');
  const [company, setCompany] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportTypes = [
    { value: 'sales', label: 'Продажи', icon: <TrendingUp /> },
    { value: 'service', label: 'Сервис', icon: <Assignment /> },
    { value: 'financial', label: 'Финансы', icon: <AttachMoney /> },
    { value: 'inventory', label: 'Инвентарь', icon: <Inventory /> },
    { value: 'projects', label: 'Проекты', icon: <Business /> },
    { value: 'comprehensive', label: 'Комплексный', icon: <TrendingUp /> }
  ];

  const fetchReport = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

      if (company) {
        params.append('company', company);
      }

      const response = await erpApi.get(`/reports/${reportType}/?${params}`);
      setReportData(response.data);
    } catch (err) {
      setError('Ошибка при загрузке отчета');
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await erpApi.get('/dashboard/metrics/');
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, company, startDate, endDate]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const renderSummaryCards = () => {
    if (!reportData?.summary) return null;

    const summary = reportData.summary;
    const cards = [];

    for (const [key, value] of Object.entries(summary)) {
      if (typeof value === 'number') {
        cards.push(
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {key.replace(/_/g, ' ').toUpperCase()}
                </Typography>
                <Typography variant="h4">
                  {key.includes('revenue') || key.includes('price') || key.includes('amount') 
                    ? formatCurrency(value)
                    : value.toLocaleString('ru-RU')
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      }
    }

    return cards;
  };

  const renderChart = () => {
    if (!reportData?.daily_stats) return null;

    const data = reportData.daily_stats.map((item: any) => ({
      date: formatDate(item.date),
      ...item
    }));

    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Динамика по дням
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
              <Line type="monotone" dataKey="sales_count" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderTopPerformers = () => {
    if (!dashboardData?.top_performers) return null;

    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Топ исполнители
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Исполнитель</TableCell>
                  <TableCell>Всего задач</TableCell>
                  <TableCell>Завершено</TableCell>
                  <TableCell>Процент выполнения</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.top_performers.map((performer, index) => (
                  <TableRow key={index}>
                    <TableCell>{performer.assignee__username}</TableCell>
                    <TableCell>{performer.tasks_count}</TableCell>
                    <TableCell>{performer.completed_count}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(performer.completed_count / performer.tasks_count) * 100}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round((performer.completed_count / performer.tasks_count) * 100)}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const renderRecentActivities = () => {
    if (!dashboardData?.recent_activities) return null;

    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Последние активности
          </Typography>
          {dashboardData.recent_activities.map((activity, index) => (
            <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="primary">
                {activity.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {activity.description}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Chip label={activity.company} size="small" />
                <Typography variant="caption" color="textSecondary">
                  {formatDate(activity.date)}
                </Typography>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Отчеты ERP
        </Typography>

        {/* Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Тип отчета</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    label="Тип отчета"
                  >
                    {reportTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {type.icon}
                          <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Компания</InputLabel>
                  <Select
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    label="Компания"
                  >
                    <MenuItem value="">Все компании</MenuItem>
                    <MenuItem value="1">Компания 1</MenuItem>
                    <MenuItem value="2">Компания 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <DatePicker
                  label="Начальная дата"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <DatePicker
                  label="Конечная дата"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={fetchReport}
                    disabled={loading}
                    startIcon={<Refresh />}
                  >
                    Обновить
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    disabled={!reportData}
                  >
                    Экспорт
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {reportData && (
          <>
            {/* Summary Cards */}
            <Grid container spacing={2}>
              {renderSummaryCards()}
            </Grid>

            {/* Chart */}
            {renderChart()}

            {/* Top Performers */}
            {renderTopPerformers()}

            {/* Recent Activities */}
            {renderRecentActivities()}
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Reports; 