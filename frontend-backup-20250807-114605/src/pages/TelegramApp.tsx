import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Button, 
  Chip, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { 
  Home,
  Search,
  Favorite,
  Person,
  Add,
  FilterList,
  ViewModule,
  ViewList
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetVehiclesQuery } from '@/services/api';

// Стилизованные компоненты для Telegram Mini App
const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  }
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(0, 122, 255, 0.1)',
  color: '#007AFF',
  border: '1px solid rgba(0, 122, 255, 0.3)',
  fontWeight: 500,
  '&:hover': {
    background: 'rgba(0, 122, 255, 0.2)',
  }
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 25,
    background: 'rgba(255, 255, 255, 0.9)',
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(0, 122, 255, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#007AFF',
    },
  },
}));

const TelegramApp: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    vehicle_type: '',
    search: '',
    price_min: 0,
    price_max: 100000000,
  });
  
  const { data: vehiclesData, isLoading } = useGetVehiclesQuery({
    vehicle_type: filters.vehicle_type,
    limit: 20
  });

  const categories = [
    { id: '', name: 'Вся техника', icon: '🚗' },
    { id: 'car', name: 'Автомобили', icon: '🏎️' },
    { id: 'motorcycle', name: 'Мотоциклы', icon: '🏍️' },
    { id: 'boat', name: 'Лодки', icon: '⛵' },
    { id: 'helicopter', name: 'Вертолеты', icon: '🚁' },
    { id: 'airplane', name: 'Самолеты', icon: '✈️' },
  ];

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { label: 'Главная', icon: <Home />, value: 0 },
    { label: 'Поиск', icon: <Search />, value: 1 },
    { label: 'Избранное', icon: <Favorite />, value: 2 },
    { label: 'Профиль', icon: <Person />, value: 3 },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f5f7 0%, #ffffff 100%)',
      pb: 8 // Space for bottom navigation
    }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
        color: 'white',
        py: 2,
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <Container maxWidth="sm">
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }}>
            VELES AUTO
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.9 }}>
            Премиальная техника в Telegram
          </Typography>
        </Container>
      </Box>

      {/* Content based on current tab */}
      {currentTab === 0 && (
        <Container maxWidth="sm" sx={{ py: 2 }}>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
              color: 'white',
              p: 3,
              mb: 3,
              borderRadius: 3
            }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Добро пожаловать в VELES AUTO
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                Найдите свою идеальную технику прямо в Telegram
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  background: 'white',
                  color: '#007AFF',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
                onClick={() => setCurrentTab(1)}
              >
                Начать поиск
              </Button>
            </Card>
          </motion.div>

          {/* Categories */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Категории техники
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                label={`${category.icon} ${category.name}`}
                onClick={() => {
                  handleFilterChange('vehicle_type', category.id);
                  setCurrentTab(1);
                }}
                variant={filters.vehicle_type === category.id ? 'filled' : 'outlined'}
                sx={{ 
                  background: filters.vehicle_type === category.id ? 'rgba(0, 122, 255, 0.2)' : 'transparent',
                  color: filters.vehicle_type === category.id ? 'white' : '#007AFF',
                }}
              />
            ))}
          </Box>

          {/* Featured Vehicles */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Популярная техника
          </Typography>
          <Grid container spacing={2}>
            {vehiclesData?.results?.slice(0, 6).map((vehicle, index) => (
              <Grid item xs={6} key={vehicle.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <StyledCard onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={vehicle.images?.[0]?.image || '/images/placeholder.jpg'}
                      alt={`${vehicle.brand.name} ${vehicle.model.name}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {vehicle.brand.name} {vehicle.model.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        {vehicle.year} • {vehicle.power} л.с.
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#007AFF', fontWeight: 700 }}>
                        {vehicle.price.toLocaleString()} ₽
                      </Typography>
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {currentTab === 1 && (
        <Container maxWidth="sm" sx={{ py: 2 }}>
          {/* Search Bar */}
          <SearchBar
            fullWidth
            placeholder="Поиск техники..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                label={category.name}
                onClick={() => handleFilterChange('vehicle_type', category.id)}
                variant={filters.vehicle_type === category.id ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Box>

          {/* View Mode Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Результаты поиска
            </Typography>
            <Box sx={{ display: 'flex', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1 }}>
              <Button
                size="small"
                onClick={() => setViewMode('grid')}
                sx={{
                  minWidth: 'auto',
                  px: 1,
                  color: viewMode === 'grid' ? '#007AFF' : 'text.secondary',
                  background: viewMode === 'grid' ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                }}
              >
                <ViewModule fontSize="small" />
              </Button>
              <Button
                size="small"
                onClick={() => setViewMode('list')}
                sx={{
                  minWidth: 'auto',
                  px: 1,
                  color: viewMode === 'list' ? '#007AFF' : 'text.secondary',
                  background: viewMode === 'list' ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                }}
              >
                <ViewList fontSize="small" />
              </Button>
            </Box>
          </Box>

          {/* Vehicles Grid/List */}
          <Grid container spacing={2}>
            {vehiclesData?.results?.map((vehicle, index) => (
              <Grid item xs={viewMode === 'grid' ? 6 : 12} key={vehicle.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <StyledCard 
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    sx={viewMode === 'list' ? { display: 'flex', flexDirection: 'row' } : {}}
                  >
                    <CardMedia
                      component="img"
                      height={viewMode === 'list' ? 100 : 120}
                      width={viewMode === 'list' ? 120 : '100%'}
                      image={vehicle.images?.[0]?.image || '/images/placeholder.jpg'}
                      alt={`${vehicle.brand.name} ${vehicle.model.name}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 2, flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {vehicle.brand.name} {vehicle.model.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        {vehicle.year} • {vehicle.power} л.с. • {vehicle.mileage.toLocaleString()} км
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#007AFF', fontWeight: 700 }}>
                          {vehicle.price.toLocaleString()} ₽
                        </Typography>
                        <Chip 
                          label={vehicle.vehicle_type === 'car' ? 'Авто' : 
                                 vehicle.vehicle_type === 'motorcycle' ? 'Мото' :
                                 vehicle.vehicle_type === 'boat' ? 'Лодка' :
                                 vehicle.vehicle_type === 'helicopter' ? 'Вертолет' :
                                 vehicle.vehicle_type === 'airplane' ? 'Самолет' : 'Техника'}
                          size="small"
                          sx={{ background: 'rgba(0, 122, 255, 0.1)', color: '#007AFF' }}
                        />
                      </Box>
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {currentTab === 2 && (
        <Container maxWidth="sm" sx={{ py: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Избранное
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Favorite sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Здесь будут ваши избранные предложения
            </Typography>
          </Box>
        </Container>
      )}

      {currentTab === 3 && (
        <Container maxWidth="sm" sx={{ py: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Профиль
          </Typography>
          <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Добро пожаловать в VELES AUTO
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Войдите в аккаунт для доступа к избранному и истории
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{
                background: '#007AFF',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Войти в аккаунт
            </Button>
          </Card>
        </Container>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation
        value={currentTab}
        onChange={(_, newValue) => setCurrentTab(newValue)}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            '&.Mui-selected': {
              color: '#007AFF',
            }
          }
        }}
      >
        {tabs.map((tab) => (
          <BottomNavigationAction
            key={tab.value}
            label={tab.label}
            icon={tab.icon}
            value={tab.value}
          />
        ))}
      </BottomNavigation>

      {/* Floating Action Button for Quick Actions */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          background: '#007AFF',
          '&:hover': {
            background: '#0056CC',
          }
        }}
        onClick={() => navigate('/contact')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default TelegramApp; 