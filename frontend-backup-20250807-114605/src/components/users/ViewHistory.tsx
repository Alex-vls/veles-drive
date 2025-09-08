import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { CarCard } from './components/cars/CarCard';
import { usersService } from './services/users';
import { Car } from './types/car';

interface Props {
  userId: number;
}

const ViewHistory: React.FC<Props> = ({ userId }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchViewHistory = async () => {
    try {
      setLoading(true);
      const response = await usersService.getViewHistory(userId, {
        page,
        page_size: 12,
        ordering: '-viewed_at',
      });
      setCars(response.results);
      setTotalPages(Math.ceil(response.count / 12));
    } catch (err) {
      setError('Ошибка при загрузке истории просмотров');
      console.error('Error fetching view history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViewHistory();
  }, [userId, page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleClearHistory = async () => {
    try {
      setLoading(true);
      await usersService.clearViewHistory(userId);
      setCars([]);
      setTotalPages(1);
    } catch (err) {
      setError('Ошибка при очистке истории просмотров');
      console.error('Error clearing view history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (cars.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6" gutterBottom>
          История просмотров пуста
        </Typography>
        <Button variant="contained" href="/cars">
          Перейти к поиску автомобилей
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          История просмотров
        </Typography>
        <Tooltip title="Очистить историю">
          <IconButton onClick={handleClearHistory} color="error">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Grid container spacing={3}>
        {cars.map((car) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={car.id}>
            <CarCard car={car} />
          </Grid>
        ))}
      </Grid>
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default ViewHistory; 