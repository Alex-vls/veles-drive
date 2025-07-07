import React from 'react';
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
  Container,
} from '@mui/material';
import { useGetVehicleQuery } from '@/services/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: vehicle, isLoading, error } = useGetVehicleQuery(
    parseInt(id || '0'),
    { skip: !id }
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !vehicle) {
    return (
      <Alert severity="error">
        {error ? 'Ошибка загрузки автомобиля' : 'Автомобиль не найден'}
      </Alert>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button onClick={() => navigate('/cars')} sx={{ mb: 2 }}>
          ← Назад к списку
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {vehicle.brand?.name} {vehicle.model?.name}
        </Typography>
        
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {vehicle.year} • {vehicle.mileage} км • {vehicle.fuel_type_display}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main Image */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={vehicle.main_image || vehicle.images?.[0]?.image || 'https://via.placeholder.com/600x400'}
              alt={`${vehicle.brand?.name} ${vehicle.model?.name}`}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
        </Grid>

        {/* Price and Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h4" color="primary" gutterBottom>
              {formatPrice(vehicle.price)}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Chip 
                label={vehicle.is_available ? 'Доступен' : 'Недоступен'} 
                color={vehicle.is_available ? 'success' : 'error'}
                sx={{ mr: 1 }}
              />
              <Chip label={vehicle.condition || 'Новый'} variant="outlined" />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="contained" size="large" fullWidth>
                Связаться с продавцом
              </Button>
              <Button variant="outlined" size="large" fullWidth>
                Добавить в избранное
              </Button>
              {user && (
                <Button 
                  variant="outlined" 
                  size="large" 
                  fullWidth
                  onClick={() => navigate(`/cars/${vehicle.id}/edit`)}
                >
                  Редактировать
                </Button>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Vehicle Details */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Характеристики
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Марка
                  </Typography>
                  <Typography variant="body1">
                    {vehicle.brand?.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Модель
                  </Typography>
                  <Typography variant="body1">
                    {vehicle.model?.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Год выпуска
                  </Typography>
                  <Typography variant="body1">
                    {vehicle.year}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Пробег
                  </Typography>
                  <Typography variant="body1">
                    {vehicle.mileage} км
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Тип топлива
                  </Typography>
                  <Typography variant="body1">
                    {vehicle.fuel_type_display}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Трансмиссия
                  </Typography>
                  <Typography variant="body1">
                    {vehicle.transmission_display}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Объем двигателя
                  </Typography>
                  <Typography variant="body1">
                    {vehicle.engine_volume} л
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Мощность
                  </Typography>
                  <Typography variant="body1">
                    {vehicle.power} л.с.
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Цвет
                  </Typography>
                  <Typography variant="body1">
                    {vehicle.color}
                  </Typography>
                </Grid>
                
                {vehicle.vin && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      VIN
                    </Typography>
                    <Typography variant="body1">
                      {vehicle.vin}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Описание
              </Typography>
              <Typography variant="body1">
                {vehicle.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Information */}
        {vehicle.company && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Информация о продавце
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={vehicle.company.logo} 
                    sx={{ width: 60, height: 60, mr: 2 }}
                  >
                    {vehicle.company.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {vehicle.company.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {vehicle.company.city}
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Адрес
                    </Typography>
                    <Typography variant="body1">
                      {vehicle.company.address}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Телефон
                    </Typography>
                    <Typography variant="body1">
                      {vehicle.company.phone}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {vehicle.company.email}
                    </Typography>
                  </Grid>
                  
                  {vehicle.company.website && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Веб-сайт
                      </Typography>
                      <Typography variant="body1">
                        <a href={vehicle.company.website} target="_blank" rel="noopener noreferrer">
                          {vehicle.company.website}
                        </a>
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Additional Images */}
        {vehicle.images && vehicle.images.length > 1 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Дополнительные фотографии
                </Typography>
                
                <Grid container spacing={2}>
                  {vehicle.images.slice(1).map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={image.image}
                        alt={`${vehicle.brand?.name} ${vehicle.model?.name} - фото ${index + 2}`}
                        sx={{ objectFit: 'cover', borderRadius: 1 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default CarDetails; 