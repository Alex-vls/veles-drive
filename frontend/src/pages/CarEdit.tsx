import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import CarForm from './components/cars/CarForm';
import { carsService } from './services/cars';
import { Car } from './types';
import { useAuth } from './contexts/AuthContext';

const CarEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;
      try {
        const data = await carsService.getCar(parseInt(id));
        if (user?.company?.id !== data.company.id) {
          navigate('/cars');
          return;
        }
        setCar(data);
      } catch (err) {
        setError('Ошибка загрузки данных автомобиля');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id, user, navigate]);

  const handleSubmit = async (data: FormData) => {
    if (!id) return;
    await carsService.updateCar(parseInt(id), data);
    navigate(`/cars/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !car) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || 'Автомобиль не найден'}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Редактировать автомобиль
      </Typography>
      <CarForm
        initialData={car}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/cars/${id}`)}
      />
    </Box>
  );
};

export default CarEditPage; 