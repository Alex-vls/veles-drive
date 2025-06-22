import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Avatar,
} from '@mui/material';
import { carsService } from '../services/cars';
import { Car, Review } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { getCarById } from '../data/mockData';

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (!id) return;
    const carData = getCarById(id);
    setCar(carData || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (error || !car) {
    return <Alert severity="error">{error || 'Автомобиль не найден'}</Alert>;
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            {car.images && car.images.length > 0 ? (
              <CardMedia
                component="img"
                height="340"
                image={car.images.find((img) => img.is_main)?.image || car.images[0].image}
                alt={car.brand + ' ' + car.model}
                sx={{ borderRadius: 2, mb: 2 }}
              />
            ) : (
              <Box sx={{ height: 340, bgcolor: 'grey.200', borderRadius: 2 }} />
            )}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {car.images && car.images.map((img) => (
                <Avatar
                  key={img.id}
                  src={img.image}
                  alt=""
                  variant="rounded"
                  sx={{ width: 56, height: 56, cursor: 'pointer', border: img.is_main ? '2px solid #1976d2' : undefined }}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              {car.brand} {car.model} {car.year}
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              {car.price.toLocaleString()} ₽
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip label={car.is_available ? 'В наличии' : 'Нет в наличии'} color={car.is_available ? 'success' : 'default'} sx={{ mr: 1 }} />
              <Chip label={car.transmission} sx={{ mr: 1 }} />
              <Chip label={car.fuel_type} sx={{ mr: 1 }} />
              <Chip label={car.color} />
            </Box>
            <Typography variant="body1" gutterBottom>
              <b>Пробег:</b> {car.mileage.toLocaleString()} км
            </Typography>
            <Typography variant="body1" gutterBottom>
              <b>Двигатель:</b> {car.engine_volume || car.engine} л, {car.power || 'N/A'} л.с.
            </Typography>
            <Typography variant="body1" gutterBottom>
              <b>Описание:</b> {car.description}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Добавлено: {car.created_at ? format(new Date(car.created_at), 'PP', { locale: ru }) : 'Дата не указана'}
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate(`/companies/${car.company.id}`)}>
              Компания: {car.company.name}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Отзывы
        </Typography>
        {reviews.length === 0 ? (
          <Typography color="text.secondary">Пока нет отзывов</Typography>
        ) : (
          <Box>
            {reviews.map((review) => (
              <Box key={review.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  {review.user.username} — {format(new Date(review.created_at), 'PP', { locale: ru })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Оценка: {review.rating} / 5
                </Typography>
                <Typography variant="body1">{review.text}</Typography>
                <Divider sx={{ my: 1 }} />
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CarDetails; 