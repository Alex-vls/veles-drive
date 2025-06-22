import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  Divider,
  ImageList,
  ImageListItem,
  Rating,
  TextField,
} from '@mui/material';
import {
  DirectionsCar,
  Speed,
  LocalGasStation,
  Settings,
  CalendarToday,
  AttachMoney,
} from '@mui/icons-material';
import { useGetCarQuery, useCreateReviewMutation } from '../../services/api';
import ReviewForm from '../../components/forms/ReviewForm';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: car, isLoading, error } = useGetCarQuery(Number(id));
  const [createReview] = useCreateReviewMutation();

  if (isLoading) {
    return (
      <Container>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  if (error || !car) {
    return (
      <Container>
        <Typography color="error">Ошибка при загрузке автомобиля</Typography>
      </Container>
    );
  }

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      await createReview({
        ...reviewData,
        car: car.id,
      }).unwrap();
      setShowReviewForm(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/cars')}
          sx={{ mb: 2 }}
        >
          Назад к списку
        </Button>

        <Grid container spacing={4}>
          {/* Car Images */}
          <Grid item xs={12} md={8}>
            <ImageList cols={2} rowHeight={300}>
              {car.images.map((image) => (
                <ImageListItem key={image.id}>
                  <img
                    src={image.image}
                    alt={`${car.brand.name} ${car.model}`}
                    loading="lazy"
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Grid>

          {/* Car Info */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                {car.brand.name} {car.model}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                {car.price.toLocaleString()} ₽
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                <Chip
                  icon={<DirectionsCar />}
                  label={car.body_type}
                />
                <Chip
                  icon={<Settings />}
                  label={car.transmission === 'manual' ? 'МКПП' : 'АКПП'}
                />
                <Chip
                  icon={<LocalGasStation />}
                  label={car.fuel_type}
                />
              </Stack>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Характеристики
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Год выпуска
                    </Typography>
                    <Typography variant="body1">
                      {car.year}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Пробег
                    </Typography>
                    <Typography variant="body1">
                      {car.mileage.toLocaleString()} км
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Цвет
                    </Typography>
                    <Typography variant="body1">
                      {car.color}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Описание
                </Typography>
                <Typography variant="body1">
                  {car.description}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => navigate(`/companies/${car.company.id}`)}
              >
                Перейти к компании
              </Button>
            </Paper>
          </Grid>

          {/* Reviews Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Отзывы</Typography>
                {isAuthenticated && (
                  <Button
                    variant="outlined"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    {showReviewForm ? 'Отмена' : 'Написать отзыв'}
                  </Button>
                )}
              </Box>

              {showReviewForm && (
                <Box sx={{ mb: 4 }}>
                  <ReviewForm
                    onSubmit={handleReviewSubmit}
                    carId={car.id}
                  />
                </Box>
              )}

              {car.reviews.map((review) => (
                <Box key={review.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>
                      {review.user.first_name} {review.user.last_name}
                    </Typography>
                    <Rating value={review.rating} readOnly size="small" />
                  </Box>
                  <Typography variant="body1">{review.comment}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(review.created_at).toLocaleDateString()}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CarDetail; 