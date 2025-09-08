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
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import { erpApi } from '../../services/erp';
import { Inventory as InventoryType } from '../../services/erp';

interface InventoryFormData {
  car_id: number;
  quantity: number;
  cost_price: number;
  selling_price: number;
  status: string;
  location: string;
  notes: string;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryType | null>(null);
  const [formData, setFormData] = useState<InventoryFormData>({
    car_id: 0,
    quantity: 1,
    cost_price: 0,
    selling_price: 0,
    status: 'available',
    location: '',
    notes: ''
  });

  useEffect(() => {
    loadInventory();
    loadStats();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await erpApi.getAllInventory();
      setInventory(data);
    } catch (err) {
      setError('Ошибка при загрузке инвентаря');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await erpApi.getInventoryStats();
      setStats(data);
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
    }
  };

  const handleOpenDialog = (item?: InventoryType) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        car_id: item.car.id,
        quantity: item.quantity,
        cost_price: item.cost_price,
        selling_price: item.selling_price,
        status: item.status,
        location: item.location,
        notes: item.notes
      });
    } else {
      setEditingItem(null);
      setFormData({
        car_id: 0,
        quantity: 1,
        cost_price: 0,
        selling_price: 0,
        status: 'available',
        location: '',
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
        await erpApi.updateInventory(editingItem.id, formData);
      } else {
        await erpApi.createInventory(formData);
      }
      handleCloseDialog();
      loadInventory();
      loadStats();
    } catch (err) {
      setError('Ошибка при сохранении');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        await erpApi.deleteInventory(id);
        loadInventory();
        loadStats();
      } catch (err) {
        setError('Ошибка при удалении');
        console.error(err);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'reserved': return 'warning';
      case 'sold': return 'error';
      case 'maintenance': return 'info';
      case 'damaged': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Доступен';
      case 'reserved': return 'Зарезервирован';
      case 'sold': return 'Продан';
      case 'maintenance': return 'На обслуживании';
      case 'damaged': return 'Поврежден';
      default: return status;
    }
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
          <InventoryIcon sx={{ mr: 2 }} />
          Управление инвентарем
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить запись
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
                  <InventoryIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Всего записей
                    </Typography>
                    <Typography variant="h5">
                      {stats.total_items}
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
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Доступно
                    </Typography>
                    <Typography variant="h5">
                      {stats.available_items}
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
                  <MoneyIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Общая стоимость
                    </Typography>
                    <Typography variant="h5">
                      {stats.total_value?.toLocaleString()} ₽
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
                  <ShippingIcon color="info" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Зарезервировано
                    </Typography>
                    <Typography variant="h5">
                      {stats.reserved_items}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Таблица инвентаря */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Автомобиль</TableCell>
              <TableCell>Количество</TableCell>
              <TableCell>Себестоимость</TableCell>
              <TableCell>Цена продажи</TableCell>
              <TableCell>Маржинальность</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Местоположение</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {item.car.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {item.car.brand} {item.car.model}
                  </Typography>
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.cost_price.toLocaleString()} ₽</TableCell>
                <TableCell>{item.selling_price.toLocaleString()} ₽</TableCell>
                <TableCell>
                  <Chip
                    label={`${item.profit_margin.toFixed(1)}%`}
                    color={item.profit_margin > 0 ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(item.status)}
                    color={getStatusColor(item.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{item.location || '-'}</TableCell>
                <TableCell>
                  <Tooltip title="Просмотр">
                    <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Редактировать">
                    <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" onClick={() => handleDelete(item.id)}>
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
          {editingItem ? 'Редактировать запись' : 'Добавить запись в инвентарь'}
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
                label="Количество"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Себестоимость"
                type="number"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Цена продажи"
                type="number"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
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
                  <MenuItem value="available">Доступен</MenuItem>
                  <MenuItem value="reserved">Зарезервирован</MenuItem>
                  <MenuItem value="sold">Продан</MenuItem>
                  <MenuItem value="maintenance">На обслуживании</MenuItem>
                  <MenuItem value="damaged">Поврежден</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Местоположение"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
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

export default Inventory; 