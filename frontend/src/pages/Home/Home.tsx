import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Avatar,
  Divider,
} from '@mui/material';
import {
  DirectionsCar,
  Business,
  Article,
  Star,
  TrendingUp,
  Security,
  Speed,
  Support,
  ArrowForward,
  LocationOn,
  Phone,
  Language,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getTopCars, getTopCompanies, getLatestNews } from '../../data/mockData';

const Home: React.FC = () => {
  const topCars = getTopCars(6);
  const topCompanies = getTopCompanies(4);
  const latestNews = getLatestNews(6);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ru-RU').format(mileage) + ' км';
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0071E3 0%, #007AFF 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  mb: 3,
                  lineHeight: 1.2,
                }}
              >
                Найдите свой
                <br />
                идеальный автомобиль
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}
              >
                Лучший агрегатор автомобилей и компаний. 
                Тысячи предложений от проверенных дилеров.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={RouterLink}
                  to="/cars"
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: 'white',
                    color: '#0071E3',
                    px: 4,
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: '#F5F5F7',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Найти автомобиль
                </Button>
                <Button
                  component={RouterLink}
                  to="/companies"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Компании
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    width: { xs: 300, md: 400 },
                    height: { xs: 300, md: 400 },
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <DirectionsCar sx={{ fontSize: 120, opacity: 0.8 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* About Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#F5F5F7' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                color: '#1D1D1F',
                mb: 2,
              }}
            >
              Почему VELES AUTO?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#636366',
                maxWidth: 600,
                mx: 'auto',
                fontWeight: 400,
              }}
            >
              Мы объединяем лучшие предложения от проверенных компаний, 
              чтобы вы могли найти идеальный автомобиль быстро и безопасно.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: <TrendingUp sx={{ fontSize: 40 }} />,
                title: 'Лучшие цены',
                description: 'Сравнивайте цены от разных дилеров и находите самые выгодные предложения.',
              },
              {
                icon: <Security sx={{ fontSize: 40 }} />,
                title: 'Проверенные компании',
                description: 'Все компании проходят тщательную проверку и имеют положительные отзывы.',
              },
              {
                icon: <Speed sx={{ fontSize: 40 }} />,
                title: 'Быстрый поиск',
                description: 'Мощные фильтры и умный поиск помогут найти нужный автомобиль за минуты.',
              },
              {
                icon: <Support sx={{ fontSize: 40 }} />,
                title: 'Поддержка 24/7',
                description: 'Наша команда всегда готова помочь с выбором и ответить на ваши вопросы.',
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid #E5E5EA',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 113, 227, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, #0071E3 0%, #007AFF 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        {feature.icon}
                      </Box>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1D1D1F',
                        mb: 2,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#636366',
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Top Cars Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 700,
                color: '#1D1D1F',
              }}
            >
              Топ автомобили
            </Typography>
            <Button
              component={RouterLink}
              to="/cars"
              endIcon={<ArrowForward />}
              sx={{
                color: '#0071E3',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(0, 113, 227, 0.1)',
                },
              }}
            >
              Смотреть все
            </Button>
          </Box>

          <Grid container spacing={3}>
            {topCars.map((car) => (
              <Grid item xs={12} sm={6} md={4} key={car.id}>
                <Card
                  component={RouterLink}
                  to={`/cars/${car.id}`}
                  sx={{
                    height: '100%',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid #E5E5EA',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 113, 227, 0.15)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={car.image}
                    alt={`${car.brand} ${car.model}`}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#1D1D1F',
                            mb: 0.5,
                          }}
                        >
                          {car.brand} {car.model}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: '#636366' }}
                        >
                          {car.year} • {formatMileage(car.mileage)}
                        </Typography>
                      </Box>
                      <Chip
                        label={car.condition === 'new' ? 'Новый' : 'С пробегом'}
                        size="small"
                        sx={{
                          backgroundColor: car.condition === 'new' ? '#34C759' : '#0071E3',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating value={car.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2" sx={{ color: '#636366', ml: 1 }}>
                        ({car.reviews})
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#636366',
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {car.description}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#1D1D1F',
                        }}
                      >
                        {formatPrice(car.price)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#636366' }}
                      >
                        {car.fuelType} • {car.transmission}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Top Companies Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#F5F5F7' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 700,
                color: '#1D1D1F',
              }}
            >
              Лучшие компании
            </Typography>
            <Button
              component={RouterLink}
              to="/companies"
              endIcon={<ArrowForward />}
              sx={{
                color: '#0071E3',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(0, 113, 227, 0.1)',
                },
              }}
            >
              Смотреть все
            </Button>
          </Box>

          <Grid container spacing={3}>
            {topCompanies.map((company) => (
              <Grid item xs={12} sm={6} md={3} key={company.id}>
                <Card
                  component={RouterLink}
                  to={`/companies/${company.id}`}
                  sx={{
                    height: '100%',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid #E5E5EA',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 113, 227, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        src={company.logo}
                        sx={{
                          width: 60,
                          height: 60,
                          mr: 2,
                          borderRadius: '12px',
                        }}
                      >
                        <Business />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#1D1D1F',
                            mb: 0.5,
                          }}
                        >
                          {company.name}
                        </Typography>
                        <Chip
                          label={
                            company.type === 'dealer' ? 'Дилер' :
                            company.type === 'service' ? 'Сервис' :
                            company.type === 'insurance' ? 'Страхование' : 'Аукцион'
                          }
                          size="small"
                          sx={{
                            backgroundColor: '#F5F5F7',
                            color: '#636366',
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#636366',
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                      }}
                    >
                      {company.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating value={company.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2" sx={{ color: '#636366', ml: 1 }}>
                        ({company.reviews})
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: '#636366', mr: 1 }} />
                      <Typography variant="body2" sx={{ color: '#636366', fontSize: '0.75rem' }}>
                        {company.location}
                      </Typography>
                    </Box>

                    {company.carsCount > 0 && (
                      <Typography variant="body2" sx={{ color: '#636366', fontSize: '0.75rem' }}>
                        {company.carsCount} автомобилей
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* News Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 700,
                color: '#1D1D1F',
              }}
            >
              Последние новости
            </Typography>
            <Button
              component={RouterLink}
              to="/news"
              endIcon={<ArrowForward />}
              sx={{
                color: '#0071E3',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(0, 113, 227, 0.1)',
                },
              }}
            >
              Все новости
            </Button>
          </Box>

          <Grid container spacing={3}>
            {latestNews.map((news) => (
              <Grid item xs={12} sm={6} md={4} key={news.id}>
                <Card
                  component={RouterLink}
                  to={`/news/${news.id}`}
                  sx={{
                    height: '100%',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid #E5E5EA',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 113, 227, 0.15)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={news.image}
                    alt={news.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Chip
                      label={news.category}
                      size="small"
                      sx={{
                        backgroundColor: '#F5F5F7',
                        color: '#636366',
                        fontWeight: 500,
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1D1D1F',
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4,
                      }}
                    >
                      {news.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#636366',
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                      }}
                    >
                      {news.excerpt}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#636366', fontSize: '0.75rem' }}>
                        {news.author}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#636366', fontSize: '0.75rem' }}>
                        {news.readTime} мин
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1D1D1F 0%, #2D2D30 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                mb: 3,
              }}
            >
              Готовы найти свой автомобиль?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.9,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Присоединяйтесь к тысячам довольных клиентов, которые уже нашли 
              свой идеальный автомобиль с помощью VELES AUTO.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={RouterLink}
                to="/cars"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#0071E3',
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    backgroundColor: '#007AFF',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Начать поиск
              </Button>
              <Button
                component={RouterLink}
                to="/contact"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Связаться с нами
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 