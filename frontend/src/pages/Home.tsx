import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import {
  DirectionsCar,
  Business,
  Security,
  Speed,
  Star,
  ArrowForward,
  FilterList,
  TrendingUp,
  Verified,
  CheckCircle,
} from '@mui/icons-material';
import { CompanyCard, CarCard, NewsCard } from '@/components/Cards';
import { mockCompanies, mockCars, mockNews, getTopCars, getTopCompanies, getLatestNews } from '@/data/mockData';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [favoriteCompanies, setFavoriteCompanies] = useState<number[]>([]);
  const [favoriteCars, setFavoriteCars] = useState<number[]>([]);
  const [bookmarkedNews, setBookmarkedNews] = useState<number[]>([]);

  // Отладочная информация
  console.log('Home page - Top companies:', getTopCompanies(3));
  console.log('Home page - Top cars:', getTopCars(3));
  console.log('Home page - Latest news:', getLatestNews(3));

  const handleCompanyFavorite = (companyId: number) => {
    setFavoriteCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleCarFavorite = (carId: number) => {
    setFavoriteCars(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    );
  };

  const handleNewsBookmark = (newsId: number) => {
    setBookmarkedNews(prev => 
      prev.includes(newsId) 
        ? prev.filter(id => id !== newsId)
        : [...prev, newsId]
    );
  };

  const features = [
    {
      icon: <DirectionsCar sx={{ fontSize: 48, color: '#0071E3' }} />,
      title: 'Большой выбор автомобилей',
      description: 'Тысячи автомобилей от проверенных дилеров с полной историей и гарантией качества',
    },
    {
      icon: <Business sx={{ fontSize: 48, color: '#0071E3' }} />,
      title: 'Проверенные компании',
      description: 'Работаем только с надежными автосалонами, прошедшими тщательную проверку',
    },
    {
      icon: <Security sx={{ fontSize: 48, color: '#0071E3' }} />,
      title: 'Безопасные сделки',
      description: 'Гарантируем безопасность каждой сделки с полной защитой ваших интересов',
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: '#0071E3' }} />,
      title: 'Быстрый поиск',
      description: 'Удобные фильтры и умный поиск помогут найти идеальный автомобиль за минуты',
    },
  ];

  return (
    <Box sx={{ pt: '72px' }}>
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
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.1,
                }}
              >
                Найдите свой идеальный автомобиль
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  lineHeight: 1.4,
                  fontWeight: 400,
                }}
              >
                VELES AUTO - ваш надежный партнер в поиске автомобиля мечты. 
                Тысячи предложений от проверенных дилеров в одном месте.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/cars')}
                  sx={{
                    backgroundColor: 'white',
                    color: '#0071E3',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#F5F5F7',
                    },
                  }}
                >
                  Смотреть подборки
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/companies')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Найти компанию
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 300, md: 400 },
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0, 113, 227, 0.3)',
                }}
              >
                <Box
                  component="img"
                  src="/images/hero-car.jpg"
                  alt="Luxury Car"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* About Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#F5F5F7' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: '#1D1D1F',
              }}
            >
              О нас
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: '#636366',
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              VELES AUTO - ведущий агрегатор автомобилей и компаний в России. 
              Мы помогаем найти идеальный автомобиль и надежного поставщика.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 4,
                    border: '1px solid #E5E5EA',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 32px rgba(60,60,67,0.12)',
                    },
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: '#1D1D1F',
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
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Top Companies Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: '#1D1D1F',
                }}
              >
                Топ подборки
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#636366',
                  fontWeight: 400,
                }}
              >
                Лучшие компании и автомобили
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                sx={{
                  borderColor: '#0071E3',
                  color: '#0071E3',
                  fontWeight: 600,
                }}
              >
                Фильтры
              </Button>
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/companies')}
                sx={{
                  background: 'linear-gradient(135deg, #0071E3 0%, #007AFF 100%)',
                  fontWeight: 600,
                  '&:hover': {
                    background: '#0071E3',
                  },
                }}
              >
                Смотреть все
              </Button>
            </Box>
          </Box>

          <Grid container spacing={4} sx={{ mb: 8 }}>
            {getTopCompanies(3).map((company) => (
              <Grid item xs={12} md={4} key={company.id}>
                <CompanyCard
                  company={company}
                  onEdit={undefined}
                  onDelete={undefined}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Top Cars Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#F5F5F7' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: '#1D1D1F',
              }}
            >
              Популярные автомобили
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#636366',
                fontWeight: 400,
              }}
            >
              Самые востребованные модели от проверенных дилеров
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {getTopCars(3).map((car) => (
              <Grid item xs={12} md={4} key={car.id}>
                <CarCard
                  car={car}
                  onEdit={undefined}
                  onDelete={undefined}
                />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/cars')}
              sx={{
                background: 'linear-gradient(135deg, #0071E3 0%, #007AFF 100%)',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: '#0071E3',
                },
              }}
            >
              Смотреть все автомобили
            </Button>
          </Box>
        </Container>
      </Box>

      {/* News Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: '#1D1D1F',
              }}
            >
              Новости и обзоры
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#636366',
                fontWeight: 400,
              }}
            >
              Актуальная информация из мира автомобилей
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {getLatestNews(3).map((news) => (
              <Grid item xs={12} md={4} key={news.id}>
                <NewsCard
                  news={{
                    id: parseInt(news.id),
                    title: news.title,
                    excerpt: news.excerpt,
                    content: news.content,
                    image: news.image,
                    author: {
                      name: news.author,
                      avatar: undefined,
                    },
                    publishedAt: news.date,
                    category: news.category,
                    readTime: news.readTime,
                    tags: news.tags,
                    isBookmarked: false,
                  }}
                  onBookmarkToggle={handleNewsBookmark}
                  onShare={(id) => console.log('Share news:', id)}
                />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/news')}
              sx={{
                borderColor: '#0071E3',
                color: '#0071E3',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderColor: '#0051A3',
                  backgroundColor: 'rgba(0, 113, 227, 0.05)',
                },
              }}
            >
              Все новости
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#1D1D1F', color: 'white' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 3,
              }}
            >
              Готовы найти свой идеальный автомобиль?
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.8,
                lineHeight: 1.4,
                fontWeight: 400,
              }}
            >
              Присоединяйтесь к тысячам довольных клиентов, которые уже нашли свой автомобиль с VELES AUTO
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/cars')}
                sx={{
                  background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: '#34C759',
                  },
                }}
              >
                Смотреть автомобили
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Зарегистрироваться
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 