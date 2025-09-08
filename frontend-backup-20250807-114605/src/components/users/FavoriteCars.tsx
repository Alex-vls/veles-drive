import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  Button,
} from '@mui/material';
import { CarCard } from './components/cars/CarCard';
import { usersService } from './services/users';
import { Car } from './types/car';

interface Props {
  userId: number;
}

const FavoriteCars: React.FC<Props> = ({ userId }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFavoriteCars = async () => {
    try {
      setLoading(true);
      const response = await usersService.getFavoriteCars(userId, {
        page,
        page_size: 12,
        ordering: '-created_at',
      });
      setCars(response.results);
      setTotalPages(Math.ceil(response.count / 12));
    } catch (err) {
      setError('Ошибка при загрузке избранных автомобилей');
      console.error('Error fetching favorite cars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoriteCars();
  }, [userId, page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
          У вас пока нет избранных автомобилей
        </Typography>
        <Button variant="contained" href="/cars">
          Перейти к поиску автомобилей
        </Button>
      </Box>
    );
  }

  return (
    <Box>
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

export default FavoriteCars; 