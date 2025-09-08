import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Pagination,
  TableSortLabel,
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { moderationService } from './services/moderation';
import { ModerationLog, ModerationStatus, ModerationAction, PaginatedResponse } from './types';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

type Order = 'asc' | 'desc';

const ModerationPage: React.FC = () => {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ModerationLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ModerationStatus | ''>('');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderBy, setOrderBy] = useState<keyof ModerationLog>('created_at');
  const [order, setOrder] = useState<Order>('desc');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [logsData, count] = await Promise.all([
        moderationService.getModerationLogs({
          status: statusFilter || undefined,
          content_type: contentTypeFilter || undefined,
          page,
          ordering: order === 'desc' ? `-${orderBy}` : orderBy,
        }),
        moderationService.getPendingCount(),
      ]);
      setLogs(logsData.results);
      setTotalPages(Math.ceil(logsData.count / 10));
      setPendingCount(count);
    } catch (err) {
      setError('Ошибка загрузки логов модерации');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [statusFilter, contentTypeFilter, page, orderBy, order]);

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as ModerationStatus | '');
    setPage(1);
  };

  const handleContentTypeFilterChange = (event: SelectChangeEvent) => {
    setContentTypeFilter(event.target.value);
    setPage(1);
  };

  const handleSort = (property: keyof ModerationLog) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleModerate = async (status: ModerationStatus) => {
    if (!selectedLog) return;

    try {
      const action: ModerationAction = {
        status,
        comment: comment.trim() || undefined,
      };

      await moderationService.moderate(selectedLog.id, action);
      setDialogOpen(false);
      setComment('');
      fetchLogs();
    } catch (err) {
      setError('Ошибка при модерации');
    }
  };

  const getStatusColor = (status: ModerationStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: ModerationStatus) => {
    switch (status) {
      case 'pending':
        return 'На модерации';
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Модерация
        </Typography>
        {pendingCount > 0 && (
          <Chip
            label={`Ожидает модерации: ${pendingCount}`}
            color="warning"
            variant="outlined"
          />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={statusFilter}
            label="Статус"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="pending">На модерации</MenuItem>
            <MenuItem value="approved">Одобрено</MenuItem>
            <MenuItem value="rejected">Отклонено</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Тип контента</InputLabel>
          <Select
            value={contentTypeFilter}
            label="Тип контента"
            onChange={handleContentTypeFilterChange}
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="news">Новости</MenuItem>
            <MenuItem value="article">Статьи</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Тип</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Модератор</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'created_at'}
                  direction={orderBy === 'created_at' ? order : 'asc'}
                  onClick={() => handleSort('created_at')}
                >
                  Дата
                </TableSortLabel>
              </TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.content_type_name}</TableCell>
                <TableCell>{log.content_object_title}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(log.status)}
                    color={getStatusColor(log.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.moderator_name || '-'}</TableCell>
                <TableCell>
                  {format(new Date(log.created_at), 'PPp', { locale: ru })}
                </TableCell>
                <TableCell>
                  <Tooltip title="Просмотреть">
                    <IconButton
                      size="small"
                      onClick={() => window.open(`/${log.content_type_name}/${log.object_id}`, '_blank')}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {log.status === 'pending' && (
                    <>
                      <Tooltip title="Одобрить">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => {
                            setSelectedLog(log);
                            setDialogOpen(true);
                          }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Отклонить">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedLog(log);
                            setDialogOpen(true);
                          }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {selectedLog?.status === 'pending' ? 'Модерация контента' : 'Просмотр комментария'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Комментарий"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          {selectedLog?.status === 'pending' && (
            <>
              <Button
                color="success"
                onClick={() => handleModerate('approved')}
                startIcon={<CheckCircleIcon />}
              >
                Одобрить
              </Button>
              <Button
                color="error"
                onClick={() => handleModerate('rejected')}
                startIcon={<CancelIcon />}
              >
                Отклонить
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModerationPage; 