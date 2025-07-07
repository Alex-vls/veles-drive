import React, { useState, useEffect } from 'react';
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
  useTheme,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
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
  PlayArrow,
  ChevronRight,
  // Иконки для меню
  Home as HomeIcon,
  Category as CategoryIcon,
  DirectionsCar as CarIcon,
  Flight as HelicopterIcon,
  Gavel as AuctionIcon,
  AccountBalance as LeasingIcon,
  Security as InsuranceIcon,
  Dashboard as ErpIcon,
  Telegram as TelegramIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Favorite as FavoriteIcon,
  Search as SearchIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
} from '@mui/icons-material';
import { CompanyCard, CarCard, NewsCard } from '@/components/Cards';
import { useGetVehiclesQuery } from '@/services/api';
import { useGetCompaniesQuery } from '@/services/api';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [favoriteCompanies, setFavoriteCompanies] = useState<number[]>([]);
  const [favoriteCars, setFavoriteCars] = useState<number[]>([]);
  const [bookmarkedNews, setBookmarkedNews] = useState<number[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  // Получаем данные через API
  const { data: vehiclesData, isLoading: vehiclesLoading } = useGetVehiclesQuery({
    limit: 6,
    vehicle_type: 'car'
  });
  
  const { data: companiesData, isLoading: companiesLoading } = useGetCompaniesQuery({
    limit: 4
  });

  // Автоматическая смена слайдов
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCompanyFavorite = (companyId: number) => {
    setFavoriteCompanies((prev: number[]) => 
      prev.includes(companyId) 
        ? prev.filter((id: number) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleCarFavorite = (carId: number) => {
    setFavoriteCars((prev: number[]) => 
      prev.includes(carId) 
        ? prev.filter((id: number) => id !== carId)
        : [...prev, carId]
    );
  };

  const handleNewsBookmark = (newsId: number) => {
    setBookmarkedNews((prev: number[]) => 
      prev.includes(newsId) 
        ? prev.filter((id: number) => id !== newsId)
        : [...prev, newsId]
    );
  };

  // Генерируем тестовые новости
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

  // Hero slides
  const heroSlides = [
    {
      title: "VELES AUTO",
      subtitle: "Премиальные автомобили",
      description: "Найдите свой идеальный автомобиль среди тысяч предложений от проверенных дилеров",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=800&fit=crop",
      gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
    },
    {
      title: "Электромобили",
      subtitle: "Будущее уже здесь",
      description: "Откройте для себя мир экологичного транспорта с лучшими электромобилями",
      image: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=1200&h=800&fit=crop",
      gradient: "linear-gradient(135deg, #34C759 0%, #30D158 100%)"
    },
    {
      title: "Премиум класс",
      subtitle: "Исключительное качество",
      description: "Люксовые автомобили для тех, кто ценит комфорт и стиль",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&h=800&fit=crop",
      gradient: "linear-gradient(135deg, #AF52DE 0%, #5856D6 100%)"
    }
  ];

  // Меню навигации
  const menuItems = [
    {
      title: "Основные разделы",
      items: [
        { name: "Главная", icon: <HomeIcon />, path: "/", color: "#007AFF" },
        { name: "Каталог", icon: <CategoryIcon />, path: "/vehicles", color: "#34C759" },
        { name: "Автомобили", icon: <CarIcon />, path: "/vehicles?type=car", color: "#FF9500" },
        { name: "Вертолеты", icon: <HelicopterIcon />, path: "/vehicles?type=helicopter", color: "#AF52DE" },
      ]
    },
    {
      title: "Дополнительные сервисы",
      items: [
        { name: "Аукционы", icon: <AuctionIcon />, path: "/auctions", color: "#FF3B30" },
        { name: "Лизинг", icon: <LeasingIcon />, path: "/leasing", color: "#5856D6" },
        { name: "Страхование", icon: <InsuranceIcon />, path: "/insurance", color: "#FFCC00" },
        { name: "ERP система", icon: <ErpIcon />, path: "/erp", color: "#34C759" },
      ]
    },
    {
      title: "Пользовательские функции",
      items: [
        { name: "Профиль", icon: <ProfileIcon />, path: "/profile", color: "#007AFF" },
        { name: "Избранное", icon: <FavoriteIcon />, path: "/favorites", color: "#FF3B30" },
        { name: "Уведомления", icon: <NotificationsIcon />, path: "/notifications", color: "#FF9500" },
        { name: "Настройки", icon: <SettingsIcon />, path: "/settings", color: "#636366" },
      ]
    },
    {
      title: "Интеграции",
      items: [
        { name: "Telegram Bot", icon: <TelegramIcon />, path: "/telegram-app", color: "#0088CC" },
        { name: "Поиск", icon: <SearchIcon />, path: "/search", color: "#34C759" },
        { name: "Войти", icon: <LoginIcon />, path: "/login", color: "#007AFF" },
        { name: "Регистрация", icon: <RegisterIcon />, path: "/register", color: "#34C759" },
      ]
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Apple-style Hero Section */}
      <Box
        sx={{
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Background Image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${heroSlides[currentSlide].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: heroSlides[currentSlide].gradient,
              opacity: 0.7,
            }
          }}
        />

        {/* Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography
              variant={isMobile ? 'h2' : 'h1'}
              sx={{
                fontWeight: 700,
                fontSize: isMobile ? '3rem' : '5rem',
                lineHeight: 1.1,
                mb: 2,
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              {heroSlides[currentSlide].title}
            </Typography>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              sx={{
                fontWeight: 600,
                mb: 3,
                opacity: 0.9,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              {heroSlides[currentSlide].subtitle}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 6,
                maxWidth: 600,
                mx: 'auto',
                opacity: 0.8,
                lineHeight: 1.6,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              {heroSlides[currentSlide].description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/vehicles')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  borderRadius: '50px',
                  '&:hover': { 
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Смотреть каталог
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setShowMenu(true)}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  borderRadius: '50px',
                  borderWidth: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Все возможности
              </Button>
            </Box>
          </Box>
        </Container>

        {/* Slide indicators */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
          }}
        >
          {heroSlides.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.6)',
                }
              }}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </Box>
      </Box>

      {/* Модальное окно с меню */}
      {showMenu && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(20px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
          onClick={() => setShowMenu(false)}
        >
          <Paper
            sx={{
              maxWidth: 800,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              bgcolor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1D1D1F' }}>
                  Все возможности VELES AUTO
                </Typography>
                <IconButton
                  onClick={() => setShowMenu(false)}
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' },
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>

              <Grid container spacing={3}>
                {menuItems.map((section, sectionIndex) => (
                  <Grid item xs={12} md={6} key={sectionIndex}>
                    <Card
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '16px',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#1D1D1F',
                            mb: 2,
                            pb: 1,
                            borderBottom: '2px solid #F5F5F7',
                          }}
                        >
                          {section.title}
                        </Typography>
                        <List sx={{ p: 0 }}>
                          {section.items.map((item, itemIndex) => (
                            <React.Fragment key={itemIndex}>
                              <ListItem
                                button
                                onClick={() => {
                                  navigate(item.path);
                                  setShowMenu(false);
                                }}
                                sx={{
                                  borderRadius: '12px',
                                  mb: 0.5,
                                  '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.05)',
                                    transform: 'translateX(4px)',
                                  },
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                <ListItemIcon
                                  sx={{
                                    color: item.color,
                                    minWidth: 40,
                                  }}
                                >
                                  {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                  primary={item.name}
                                  sx={{
                                    '& .MuiListItemText-primary': {
                                      fontWeight: 500,
                                      color: '#1D1D1F',
                                    },
                                  }}
                                />
                                <ChevronRight sx={{ color: '#636366', fontSize: 20 }} />
                              </ListItem>
                              {itemIndex < section.items.length - 1 && (
                                <Divider sx={{ my: 0.5, opacity: 0.3 }} />
                              )}
                            </React.Fragment>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#636366', mb: 2 }}>
                  VELES AUTO - комплексная платформа для автомобильного бизнеса
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowMenu(false)}
                  sx={{
                    bgcolor: '#007AFF',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    borderRadius: '50px',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#0056CC',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Закрыть
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Features Section - Apple Style */}
      <Box sx={{ py: 12, bgcolor: '#F5F5F7' }}>
        <Container maxWidth="lg">
          <Typography
            variant={isMobile ? 'h3' : 'h2'}
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              mb: 8,
              color: '#1D1D1F',
            }}
          >
            Почему выбирают VELES AUTO
          </Typography>
          <Grid container spacing={6}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  <Security sx={{ fontSize: 60, color: '#007AFF' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#1D1D1F' }}>
                  Безопасность
                </Typography>
                <Typography variant="body1" sx={{ color: '#636366', lineHeight: 1.6 }}>
                  Все автомобили проходят тщательную проверку и имеют полную документацию
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  <Speed sx={{ fontSize: 60, color: '#34C759' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#1D1D1F' }}>
                  Быстро
                </Typography>
                <Typography variant="body1" sx={{ color: '#636366', lineHeight: 1.6 }}>
                  Быстрый поиск и оформление сделки в течение одного дня
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  <Verified sx={{ fontSize: 60, color: '#FF9500' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#1D1D1F' }}>
                  Надежно
                </Typography>
                <Typography variant="body1" sx={{ color: '#636366', lineHeight: 1.6 }}>
                  Проверенные дилеры и гарантии на все автомобили
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  <Star sx={{ fontSize: 60, color: '#AF52DE' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#1D1D1F' }}>
                  Качество
                </Typography>
                <Typography variant="body1" sx={{ color: '#636366', lineHeight: 1.6 }}>
                  Только качественные автомобили с полной историей обслуживания
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Top Cars Section - Apple Style */}
      <Box sx={{ py: 12, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 }}>
            <Typography
              variant={isMobile ? 'h3' : 'h2'}
              sx={{ fontWeight: 700, color: '#1D1D1F' }}
            >
              Популярные автомобили
            </Typography>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ChevronRight />}
              onClick={() => navigate('/vehicles')}
              sx={{
                borderColor: '#007AFF',
                color: '#007AFF',
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '50px',
                '&:hover': {
                  bgcolor: '#007AFF',
                  color: 'white',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Смотреть все
            </Button>
          </Box>
          
          {vehiclesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#636366' }}>
                Загрузка автомобилей...
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
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

      {/* Top Companies Section - Apple Style */}
      <Box sx={{ py: 12, bgcolor: '#F5F5F7' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 }}>
            <Typography
              variant={isMobile ? 'h3' : 'h2'}
              sx={{ fontWeight: 700, color: '#1D1D1F' }}
            >
              Лучшие дилеры
            </Typography>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ChevronRight />}
              onClick={() => navigate('/companies')}
              sx={{
                borderColor: '#007AFF',
                color: '#007AFF',
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '50px',
                '&:hover': {
                  bgcolor: '#007AFF',
                  color: 'white',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Смотреть все
            </Button>
          </Box>
          
          {companiesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#636366' }}>
                Загрузка компаний...
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
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
      </Box>

      {/* Latest News Section - Apple Style */}
      <Box sx={{ py: 12, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Typography
            variant={isMobile ? 'h3' : 'h2'}
            sx={{ fontWeight: 700, mb: 8, color: '#1D1D1F' }}
          >
            Последние новости
          </Typography>
          <Grid container spacing={4}>
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