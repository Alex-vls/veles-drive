import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  AttachMoney,
  Inventory,
  Assignment,
  Business,
  Notifications,
  Refresh,
  Add,
  Visibility,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { erpApi } from '@/services/erp';

interface DashboardData {
  summary: {
    total_sales: number;
    total_revenue: number;
    total_orders: number;
    total_tasks: number;
    overdue_tasks: number;
    today_sales: number;
    today_revenue: number;
  };
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

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [summaryResponse, metricsResponse] = await Promise.all([
        erpApi.get('/dashboard/summary/'),
        erpApi.get('/dashboard/metrics/')
      ]);

      setDashboardData({
        summary: summaryResponse.data,
        ...metricsResponse.data
      });
    } catch (err) {
      setError('Ошибка при загрузке дашборда');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <AttachMoney color="success" />;
      case 'task':
        return <Assignment color="primary" />;
      default:
        return <Business color="info" />;
    }
  };

  const renderSummaryCards = () => {
    if (!dashboardData?.summary) return null;

    const { summary } = dashboardData;
    const cards = [
      {
        title: 'Общая выручка',
        value: formatCurrency(summary.total_revenue),
        icon: <AttachMoney />,
        color: '#4CAF50',
        trend: summary.today_revenue > 0 ? 'up' : 'down',
        trendValue: formatCurrency(summary.today_revenue)
      },
      {
        title: 'Продажи',
        value: summary.total_sales.toLocaleString('ru-RU'),
        icon: <TrendingUp />,
        color: '#2196F3',
        trend: summary.today_sales > 0 ? 'up' : 'down',
        trendValue: summary.today_sales
      },
      {
        title: 'Заказы на сервис',
        value: summary.total_orders.toLocaleString('ru-RU'),
        icon: <Assignment />,
        color: '#FF9800',
        trend: 'neutral',
        trendValue: null
      },
      {
        title: 'Активные задачи',
        value: summary.total_tasks.toLocaleString('ru-RU'),
        icon: <Inventory />,
        color: '#9C27B0',
        trend: summary.overdue_tasks > 0 ? 'down' : 'up',
        trendValue: summary.overdue_tasks
      }
    ];

    return cards.map((card, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: card.color, mr: 2 }}>
                {card.icon}
              </Avatar>
              <Box>
                <Typography color="textSecondary" variant="body2">
                  {card.title}
                </Typography>
                <Typography variant="h4" component="div">
                  {card.value}
                </Typography>
              </Box>
            </Box>
            
            {card.trendValue !== null && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {card.trend === 'up' ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : card.trend === 'down' ? (
                  <TrendingDown color="error" fontSize="small" />
                ) : null}
                <Typography
                  variant="body2"
                  color={card.trend === 'up' ? 'success.main' : card.trend === 'down' ? 'error.main' : 'text.secondary'}
                  sx={{ ml: 0.5 }}
                >
                  {card.trend === 'neutral' ? 'Стабильно' : `Сегодня: ${card.trendValue}`}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  const renderRevenueChart = () => {
    if (!dashboardData?.revenue_trend) return null;

    const { sales, service } = dashboardData.revenue_trend;
    const combinedData = sales.map((item, index) => ({
      date: formatDate(item.date),
      sales: item.revenue,
      service: service[index]?.revenue || 0
    }));

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Динамика выручки
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="sales" stroke="#2196F3" name="Продажи" />
              <Line type="monotone" dataKey="service" stroke="#4CAF50" name="Сервис" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderTopPerformers = () => {
    if (!dashboardData?.top_performers) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Топ исполнители
          </Typography>
          <List>
            {dashboardData.top_performers.map((performer, index) => {
              const completionRate = (performer.completed_count / performer.tasks_count) * 100;
              return (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: COLORS[index % COLORS.length] }}>
                        {performer.assignee__username.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={performer.assignee__username}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Задач: {performer.tasks_count} | Завершено: {performer.completed_count}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={completionRate}
                                color={completionRate >= 80 ? 'success' : completionRate >= 60 ? 'warning' : 'error'}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(completionRate)}%
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Chip
                      label={completionRate >= 80 ? 'Отлично' : completionRate >= 60 ? 'Хорошо' : 'Требует внимания'}
                      color={completionRate >= 80 ? 'success' : completionRate >= 60 ? 'warning' : 'error'}
                      size="small"
                    />
                  </ListItem>
                  {index < dashboardData.top_performers.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </CardContent>
      </Card>
    );
  };

  const renderRecentActivities = () => {
    if (!dashboardData?.recent_activities) return null;

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Последние активности
            </Typography>
            <Button size="small" startIcon={<Visibility />}>
              Все активности
            </Button>
          </Box>
          <List>
            {dashboardData.recent_activities.slice(0, 5).map((activity, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'grey.200' }}>
                      {getStatusIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {activity.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Chip label={activity.company} size="small" variant="outlined" />
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(activity.date)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < Math.min(5, dashboardData.recent_activities.length) - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };

  const renderQuickActions = () => {
    const actions = [
      { label: 'Новая продажа', icon: <Add />, color: 'primary' },
      { label: 'Создать задачу', icon: <Assignment />, color: 'secondary' },
      { label: 'Добавить услугу', icon: <Business />, color: 'success' },
      { label: 'Уведомления', icon: <Notifications />, color: 'warning' }
    ];

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Быстрые действия
          </Typography>
          <Grid container spacing={2}>
            {actions.map((action, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Button
                  variant="outlined"
                  startIcon={action.icon}
                  color={action.color as any}
                  fullWidth
                  sx={{ height: 60 }}
                >
                  {action.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchDashboard}>
            Повторить
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Панель управления ERP
        </Typography>
        <Box>
          <Tooltip title="Обновить">
            <IconButton onClick={fetchDashboard}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {renderSummaryCards()}
      </Grid>

      {/* Charts and Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          {renderRevenueChart()}
        </Grid>
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {renderQuickActions()}
            {renderTopPerformers()}
          </Box>
        </Grid>
        <Grid item xs={12}>
          {renderRecentActivities()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 