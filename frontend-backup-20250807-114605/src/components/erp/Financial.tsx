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
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AccountBalance as FinancialIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { erpApi } from '../../services/erp';
import { Financial as FinancialType } from '../../services/erp';

interface FinancialFormData {
  operation_type: string;
  amount: number;
  description: string;
  category: string;
}

const Financial: React.FC = () => {
  const [financials, setFinancials] = useState<FinancialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<FinancialType | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<FinancialFormData>({
    operation_type: 'income',
    amount: 0,
    description: '',
    category: ''
  });

  useEffect(() => {
    loadFinancials();
    loadStats();
  }, []);

  const loadFinancials = async () => {
    try {
      setLoading(true);
      const data = await erpApi.getAllFinancial();
      setFinancials(data);
    } catch (err) {
      setError('Ошибка при загрузке финансовых операций');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await erpApi.getFinancialStats();
      setStats(data);
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
    }
  };

  const handleOpenDialog = (item?: FinancialType) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        operation_type: item.operation_type,
        amount: item.amount,
        description: item.description,
        category: item.category
      });
    } else {
      setEditingItem(null);
      setFormData({
        operation_type: 'income',
        amount: 0,
        description: '',
        category: ''
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
        await erpApi.updateFinancial(editingItem.id, formData);
      } else {
        await erpApi.createFinancial(formData);
      }
      handleCloseDialog();
      loadFinancials();
      loadStats();
    } catch (err) {
      setError('Ошибка при сохранении');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту операцию?')) {
      try {
        await erpApi.deleteFinancial(id);
        loadFinancials();
        loadStats();
      } catch (err) {
        setError('Ошибка при удалении');
        console.error(err);
      }
    }
  };

  const getOperationTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'success';
      case 'expense': return 'error';
      case 'investment': return 'info';
      case 'loan': return 'warning';
      case 'refund': return 'secondary';
      default: return 'default';
    }
  };

  const getOperationTypeLabel = (type: string) => {
    switch (type) {
      case 'income': return 'Доход';
      case 'expense': return 'Расход';
      case 'investment': return 'Инвестиция';
      case 'loan': return 'Кредит';
      case 'refund': return 'Возврат';
      default: return type;
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

  const filteredFinancials = activeTab === 0 
    ? financials.filter(f => f.operation_type === 'income')
    : financials.filter(f => f.operation_type === 'expense');

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
          <FinancialIcon sx={{ mr: 2 }} />
          Управление финансами
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить операцию
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
                  <IncomeIcon color="success" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Общий доход
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {stats.total_income?.toLocaleString()} ₽
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
                  <ExpenseIcon color="error" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Общий расход
                    </Typography>
                    <Typography variant="h5" color="error.main">
                      {stats.total_expenses?.toLocaleString()} ₽
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
                      Чистая прибыль
                    </Typography>
                    <Typography variant="h5" color={stats.net_profit >= 0 ? 'success.main' : 'error.main'}>
                      {stats.net_profit?.toLocaleString()} ₽
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
                  <CategoryIcon color="info" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Маржинальность
                    </Typography>
                    <Typography variant="h5" color={stats.profit_margin >= 0 ? 'success.main' : 'error.main'}>
                      {stats.profit_margin?.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Табы для фильтрации */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={`Доходы (${financials.filter(f => f.operation_type === 'income').length})`}
            icon={<IncomeIcon />}
            iconPosition="start"
          />
          <Tab 
            label={`Расходы (${financials.filter(f => f.operation_type === 'expense').length})`}
            icon={<ExpenseIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Таблица финансовых операций */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Тип операции</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFinancials.map((financial) => (
              <TableRow key={financial.id}>
                <TableCell>
                  <Chip
                    label={getOperationTypeLabel(financial.operation_type)}
                    color={getOperationTypeColor(financial.operation_type) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="subtitle2" 
                    color={financial.operation_type === 'income' ? 'success.main' : 'error.main'}
                  >
                    {financial.operation_type === 'income' ? '+' : '-'}
                    {financial.amount.toLocaleString()} ₽
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }}>
                    {financial.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={financial.category} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{formatDate(financial.date)}</TableCell>
                <TableCell>
                  <Tooltip title="Просмотр">
                    <IconButton size="small" onClick={() => handleOpenDialog(financial)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Редактировать">
                    <IconButton size="small" onClick={() => handleOpenDialog(financial)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" onClick={() => handleDelete(financial.id)}>
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
          {editingItem ? 'Редактировать операцию' : 'Добавить финансовую операцию'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Тип операции</InputLabel>
                <Select
                  value={formData.operation_type}
                  label="Тип операции"
                  onChange={(e) => setFormData({ ...formData, operation_type: e.target.value })}
                >
                  <MenuItem value="income">Доход</MenuItem>
                  <MenuItem value="expense">Расход</MenuItem>
                  <MenuItem value="investment">Инвестиция</MenuItem>
                  <MenuItem value="loan">Кредит</MenuItem>
                  <MenuItem value="refund">Возврат</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Сумма"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Категория"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Например: Продажи, Зарплата, Аренда, Коммунальные услуги"
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

export default Financial; 