import React from 'react';
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
  Container,
} from '@mui/material';
import { useGetCompanyQuery, useGetVehiclesQuery } from '@/services/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';

const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: company, isLoading: companyLoading, error: companyError } = useGetCompanyQuery(
    parseInt(id || '0'),
    { skip: !id }
  );

  const { data: vehiclesData, isLoading: vehiclesLoading } = useGetVehiclesQuery({
    company: parseInt(id || '0'),
    limit: 6
  }, { skip: !id });

  if (companyLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (companyError || !company) {
    return (
      <Alert severity="error">
        {companyError ? 'Ошибка загрузки компании' : 'Компания не найдена'}
      </Alert>
    );
  }

  const vehicles = vehiclesData?.results || [];

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button onClick={() => navigate('/companies')} sx={{ mb: 2 }}>
          ← Назад к списку
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Company Header */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  src={company.logo} 
                  sx={{ width: 80, height: 80, mr: 3 }}
                >
                  {company.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {company.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Chip 
                      label={`${company.rating} ★`} 
                      color="primary" 
                      variant="outlined"
                    />
                    {company.is_verified && (
                      <Chip label="Проверена" color="success" size="small" />
                    )}
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {company.city} • {company.address}
                  </Typography>
                </Box>
                {user && (
                  <Button 
                    variant="outlined"
                    onClick={() => navigate(`/companies/${company.id}/edit`)}
                  >
                    Редактировать
                  </Button>
                )}
              </Box>
              
              <Typography variant="body1" paragraph>
                {company.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Контактная информация
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Телефон
                  </Typography>
                  <Typography variant="body1">
                    {company.phone}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {company.email}
                  </Typography>
                </Grid>
                
                {company.website && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Веб-сайт
                    </Typography>
                    <Typography variant="body1">
                      <a href={company.website} target="_blank" rel="noopener noreferrer">
                        {company.website}
                      </a>
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Дата регистрации
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(company.created_at)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Статистика
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Рейтинг
                </Typography>
                <Typography variant="h4" color="primary">
                  {company.rating}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Автомобилей в продаже
                </Typography>
                <Typography variant="h4">
                  {vehicles.length}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  На сайте с
                </Typography>
                <Typography variant="body1">
                  {formatDate(company.created_at)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Images */}
        {company.images && company.images.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Фотографии компании
                </Typography>
                
                <Grid container spacing={2}>
                  {company.images.map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={image.image}
                        alt={`${company.name} - фото ${index + 1}`}
                        sx={{ objectFit: 'cover', borderRadius: 1 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Company Features */}
        {company.features && company.features.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Особенности
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {company.features.map((feature, index) => (
                    <Chip
                      key={index}
                      label={`${feature.name}: ${feature.value}`}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Company Vehicles */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Автомобили в продаже
                </Typography>
                <Button 
                  variant="outlined"
                  onClick={() => navigate(`/cars?company=${company.id}`)}
                >
                  Смотреть все
                </Button>
              </Box>
              
              {vehiclesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : vehicles.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                  У компании пока нет автомобилей в продаже
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {vehicles.map((vehicle) => (
                    <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                      <Card 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/cars/${vehicle.id}`)}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={vehicle.main_image || vehicle.images?.[0]?.image || 'https://via.placeholder.com/400x200'}
                          alt={`${vehicle.brand?.name} ${vehicle.model?.name}`}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {vehicle.brand?.name} {vehicle.model?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {vehicle.year} • {vehicle.mileage} км • {vehicle.fuel_type_display}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {new Intl.NumberFormat('ru-RU', {
                              style: 'currency',
                              currency: 'RUB'
                            }).format(vehicle.price)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Company Reviews */}
        {company.company_reviews && company.company_reviews.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Отзывы о компании
                </Typography>
                
                {company.company_reviews.map((review, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                        {review.user?.username?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {review.user?.username || 'Аноним'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(review.created_at)}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <Chip 
                          label={`${review.rating} ★`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body1">
                      {review.text}
                    </Typography>
                    {index < company.company_reviews.length - 1 && (
                      <Divider sx={{ mt: 2 }} />
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default CompanyDetails; 