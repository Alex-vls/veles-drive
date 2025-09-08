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
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Language,
  AccessTime,
  Verified,
} from '@mui/icons-material';
import { useGetCompanyQuery, useCreateReviewMutation } from '../../services/api';
import ReviewForm from '../../components/forms/ReviewForm';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Company, Car } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`company-tabpanel-${index}`}
      aria-labelledby={`company-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const { data: company, isLoading, error } = useGetCompanyQuery(Number(id));
  const [createReview] = useCreateReviewMutation();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      await createReview({
        ...reviewData,
        company: company?.id,
      }).unwrap();
      setShowReviewForm(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  if (error || !company) {
    return (
      <Container>
        <Typography color="error">Ошибка при загрузке компании</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/companies')}
          sx={{ mb: 2 }}
        >
          Назад к списку
        </Button>

        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <img
                  src={company.logo || '/images/company-placeholder.jpg'}
                  alt={company.name}
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
              </Box>

              <Typography variant="h4" gutterBottom>
                {company.name}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                {company.is_verified && (
                  <Chip
                    icon={<Verified />}
                    label="Проверенная"
                    color="success"
                  />
                )}
                <Chip
                  icon={<LocationOn />}
                  label={company.city}
                />
              </Stack>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Контакты
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1 }} />
                    <Typography>{company.phone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Email sx={{ mr: 1 }} />
                    <Typography>{company.email}</Typography>
                  </Box>
                  {company.website && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Language sx={{ mr: 1 }} />
                      <Typography>{company.website}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Рейтинг
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating value={company.rating} readOnly />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({company.rating})
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => navigate(`/cars?company=${company.id}`)}
              >
                Смотреть автомобили
              </Button>
            </Paper>
          </Grid>

          {/* Company Details */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="О компании" />
                <Tab label="Расписание" />
                <Tab label="Автомобили" />
                <Tab label="Отзывы" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Typography variant="body1" paragraph>
                  {company.description}
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                  Адрес
                </Typography>
                <Typography variant="body1" paragraph>
                  {company.address}
                </Typography>

                {company.features && company.features.length > 0 && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Особенности
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      {company.features.map((feature) => (
                        <Chip
                          key={feature.id}
                          label={`${feature.name}: ${feature.value}`}
                        />
                      ))}
                    </Stack>
                  </>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  {company.schedule.map((day) => (
                    <Grid item xs={12} key={day.day_of_week}>
                      <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1">
                            {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'][day.day_of_week]}
                          </Typography>
                          {day.is_closed ? (
                            <Typography color="error">Закрыто</Typography>
                          ) : (
                            <Typography>
                              {day.open_time} - {day.close_time}
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  {company.cars.map((car: Car) => (
                    <Grid item xs={12} sm={6} key={car.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/cars/${car.id}`)}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={car.images[0]?.image || '/images/car-placeholder.jpg'}
                          alt={`${car.brand.name} ${car.model}`}
                        />
                        <CardContent>
                          <Typography gutterBottom variant="h6">
                            {car.brand.name} {car.model}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {car.year} • {car.mileage} км
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {car.price.toLocaleString()} ₽
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
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
                      companyId={company.id}
                    />
                  </Box>
                )}

                {company.reviews.map((review) => (
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
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CompanyDetail; 