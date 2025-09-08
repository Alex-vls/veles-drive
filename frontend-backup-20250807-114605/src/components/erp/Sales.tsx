import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tooltip,
  Fab,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ShoppingCart as SalesIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { erpApi } from '../../services/erp';
import { Sale as SaleType } from '../../services/erp';

interface SaleFormData {
  car_id: number;
  customer_id: number;
  sale_price: number;
  commission: number;
  status: string;
  notes: string;
}

const Sales: React.FC = () => {
  const [sales, setSales] = useState<SaleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<SaleType | null>(null);
  const [formData, setFormData] = useState<SaleFormData>({
    car_id: 0,
    customer_id: 0,
    sale_price: 0,
    commission: 0,
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    loadSales();
    loadStats();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await erpApi.getAllSales();
      setSales(data);
    } catch (err) {
      setError('Ошибка при загрузке продаж');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await erpApi.getSalesStats();
      setStats(data);
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
    }
  };

  const handleOpenDialog = (item?: SaleType) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        car_id: item.car.id,
        customer_id: item.customer.id,
        sale_price: item.sale_price,
        commission: item.commission,
        status: item.status,
        notes: item.notes
      });
    } else {
      setEditingItem(null);
      setFormData({
        car_id: 0,
        customer_id: 0,
        sale_price: 0,
        commission: 0,
        status: 'pending',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await erpApi.updateSale(editingItem.id, formData);
      } else {
        await erpApi.createSale(formData);
      }
      handleCloseDialog();
      loadSales();
      loadStats();
    } catch (err) {
      setError('Ошибка при сохранении');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту продажу?')) {
      try {
        await erpApi.deleteSale(id);
        loadSales();
        loadStats();
      } catch (err) {
        setError('Ошибка при удалении');
        console.error(err);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'В ожидании';
      case 'completed': return 'Завершена';
      case 'cancelled': return 'Отменена';
      case 'refunded': return 'Возврат';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" display="flex" alignItems="center">
          <SalesIcon sx={{ mr: 2 }} />
          Управление продажами
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить продажу
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Статистика */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <SalesIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Всего продаж
                    </Typography>
                    <Typography variant="h5">
                      {stats.total_sales}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <MoneyIcon color="success" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Общая выручка
                    </Typography>
                    <Typography variant="h5">
                      {stats.total_revenue?.toLocaleString()} ₽
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Средняя цена
                    </Typography>
                    <Typography variant="h5">
                      {stats.average_sale_price?.toLocaleString()} ₽
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Завершено
                    </Typography>
                    <Typography variant="h5">
                      {stats.completed_sales}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Таблица продаж */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Автомобиль</TableCell>
              <TableCell>Покупатель</TableCell>
              <TableCell>Цена продажи</TableCell>
              <TableCell>Комиссия</TableCell>
              <TableCell>Общая сумма</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата продажи</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {sale.car.title.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {sale.car.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {sale.car.brand} {sale.car.model}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="subtitle2">
                      {sale.customer.username}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{sale.sale_price.toLocaleString()} ₽</TableCell>
                <TableCell>{sale.commission.toLocaleString()} ₽</TableCell>
                <TableCell>
                  <Typography variant="subtitle2" color="primary">
                    {sale.total_amount.toLocaleString()} ₽
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(sale.status)}
                    color={getStatusColor(sale.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(sale.sale_date)}</TableCell>
                <TableCell>
                  <Tooltip title="Просмотр">
                    <IconButton size="small" onClick={() => handleOpenDialog(sale)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Редактировать">
                    <IconButton size="small" onClick={() => handleOpenDialog(sale)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" onClick={() => handleDelete(sale.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Диалог добавления/редактирования */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Редактировать продажу' : 'Добавить продажу'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID автомобиля"
                type="number"
                value={formData.car_id}
                onChange={(e) => setFormData({ ...formData, car_id: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID покупателя"
                type="number"
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Цена продажи"
                type="number"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Комиссия"
                type="number"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={formData.status}
                  label="Статус"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="pending">В ожидании</MenuItem>
                  <MenuItem value="completed">Завершена</MenuItem>
                  <MenuItem value="cancelled">Отменена</MenuItem>
                  <MenuItem value="refunded">Возврат</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Примечания"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAB для быстрого добавления */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Sales; 