import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Button,
} from '@mui/material';
import { companiesService } from '../services/companies';
import { carsService } from '../services/cars';
import { Company, Review, Car } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { getCompanyById, getCarsByCompany } from '../data/mockData';

const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (!id) return;
    const companyData = getCompanyById(id);
    setCompany(companyData || null);
    setCars(companyData ? getCarsByCompany(id) : []);
    setLoading(false);
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (error || !company) {
    return <Alert severity="error">{error || 'Компания не найдена'}</Alert>;
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            {company.logo && (
              <CardMedia
                component="img"
                height="180"
                image={company.logo}
                alt={company.name}
                sx={{ borderRadius: 2, mb: 2 }}
              />
            )}
            <Typography variant="h5" gutterBottom>
              {company.name}
            </Typography>
            <Chip label={company.is_verified ? 'Проверена' : 'Не проверена'} color={company.is_verified ? 'success' : 'default'} sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {company.address}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Рейтинг: {company.rating.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Добавлено: {format(new Date(company.created_at), 'PP', { locale: ru })}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {company.description}
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Автомобили компании
            </Typography>
            {cars.length === 0 ? (
              <Typography color="text.secondary">Нет автомобилей</Typography>
            ) : (
              <Grid container spacing={2}>
                {cars.map((car) => (
                  <Grid item xs={12} sm={6} md={4} key={car.id}>
                    <Card>
                      <CardContent sx={{ p: 1 }}>
                        <Button onClick={() => navigate(`/cars/${car.id}`)} sx={{ p: 0, textTransform: 'none' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {car.images && car.images.length > 0 && (
                              <Avatar
                                src={car.images.find((img) => img.is_main)?.image || car.images[0].image}
                                alt={car.brand + ' ' + car.model}
                                variant="rounded"
                                sx={{ width: 56, height: 56, mr: 2 }}
                              />
                            )}
                            <Box>
                              <Typography variant="subtitle1">
                                {car.brand} {car.model}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {car.year} • {car.price.toLocaleString()} ₽
                              </Typography>
                            </Box>
                          </Box>
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Отзывы о компании
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

export default CompanyDetails; 