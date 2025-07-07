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
import { useGetVehiclesQuery } from '@/services/api';
import { useGetCompaniesQuery } from '@/services/api';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [favoriteCompanies, setFavoriteCompanies] = useState<number[]>([]);
  const [favoriteCars, setFavoriteCars] = useState<number[]>([]);
  const [bookmarkedNews, setBookmarkedNews] = useState<number[]>([]);

  // Получаем данные через API
  const { data: vehiclesData, isLoading: vehiclesLoading } = useGetVehiclesQuery({
    limit: 6,
    vehicle_type: 'car'
  });
  
  const { data: companiesData, isLoading: companiesLoading } = useGetCompaniesQuery({
    limit: 4
  });

  // Отладочная информация
  console.log('Home page - Top companies:', companiesData?.results);
  console.log('Home page - Top cars:', vehiclesData?.results);

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

  // Генерируем тестовые новости (пока нет API для новостей)
  const mockNews = [
    {
      id: '1',
      title: 'Новые электромобили Tesla Model Y поступили в продажу',
      excerpt: 'Компания Tesla объявила о начале продаж нового электромобиля Model Y в России.',
      content: 'Полный текст новости о Tesla Model Y...',
      image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=400&h=250&fit=crop',
      category: 'Электромобили',
      author: 'Алексей Петров',
      date: '2024-01-15',
      readTime: 3,
      tags: ['Tesla', 'Электромобили', 'Model Y']
    },
    {
      id: '2',
      title: 'BMW представил новое поколение X5',
      excerpt: 'Немецкий автопроизводитель показал обновленный внедорожник BMW X5.',
      content: 'Полный текст новости о BMW X5...',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop',
      category: 'Новинки',
      author: 'Мария Сидорова',
      date: '2024-01-12',
      readTime: 4,
      tags: ['BMW', 'X5', 'Внедорожники']
    },
    {
      id: '3',
      title: 'Изменения в правилах ОСАГО с 2024 года',
      excerpt: 'С 1 января 2024 года вступили в силу новые правила обязательного страхования.',
      content: 'Полный текст о изменениях в ОСАГО...',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
      category: 'Страхование',
      author: 'Дмитрий Козлов',
      date: '2024-01-10',
      readTime: 5,
      tags: ['ОСАГО', 'Страхование', 'Законодательство']
    }
  ];

  const topCars = vehiclesData?.results || [];
  const topCompanies = companiesData?.results || [];
  const latestNews = mockNews;

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                VELES AUTO
              </Typography>
              <Typography variant="h5" gutterBottom>
                Премиальные автомобили и техника
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Найдите свой идеальный автомобиль среди тысяч предложений от проверенных дилеров
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/cars')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  Смотреть автомобили
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/companies')}
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  Найти дилера
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop"
                alt="Premium Car"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Почему выбирают нас
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <Security sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Безопасность
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Все автомобили проходят тщательную проверку
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <Speed sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Быстро
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Быстрый поиск и оформление сделки
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <Verified sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Надежно
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Проверенные дилеры и гарантии
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <Star sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Качество
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Только качественные автомобили
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Top Cars Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h2">
              Популярные автомобили
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/cars')}
            >
              Смотреть все
            </Button>
          </Box>
          
          {vehiclesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography>Загрузка автомобилей...</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {topCars.slice(0, 6).map((car) => (
                <Grid item xs={12} sm={6} md={4} key={car.id}>
                  <CarCard
                    car={car}
                    onFavorite={() => handleCarFavorite(car.id)}
                    isFavorite={favoriteCars.includes(car.id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Top Companies Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h2">
            Лучшие дилеры
          </Typography>
          <Button
            variant="outlined"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/companies')}
          >
            Смотреть все
          </Button>
        </Box>
        
        {companiesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Загрузка компаний...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {topCompanies.slice(0, 4).map((company) => (
              <Grid item xs={12} sm={6} md={3} key={company.id}>
                <CompanyCard
                  company={company}
                  onFavorite={() => handleCompanyFavorite(company.id)}
                  isFavorite={favoriteCompanies.includes(company.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Latest News Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom>
            Последние новости
          </Typography>
          <Grid container spacing={3}>
            {latestNews.slice(0, 3).map((news) => (
              <Grid item xs={12} md={4} key={news.id}>
                <NewsCard
                  news={news}
                  onBookmark={() => handleNewsBookmark(parseInt(news.id))}
                  isBookmarked={bookmarkedNews.includes(parseInt(news.id))}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 