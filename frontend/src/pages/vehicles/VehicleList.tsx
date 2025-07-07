import React, { useState } from 'react';
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
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { 
  FilterList, 
  Search, 
  ViewList, 
  ViewModule,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetVehiclesQuery } from '@/services/api';

const FilterDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 320,
    padding: theme.spacing(3),
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
  }
}));

const ProductCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 20,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  }
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(0, 122, 255, 0.1)',
  color: '#007AFF',
  border: '1px solid rgba(0, 122, 255, 0.3)',
  '&:hover': {
    background: 'rgba(0, 122, 255, 0.2)',
  }
}));

const VehicleList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    vehicle_type: '',
    brand: '',
    price_min: 0,
    price_max: 100000000,
    year_min: 1990,
    year_max: 2025,
    search: '',
    sort: 'newest'
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  const { data: vehiclesData, isLoading } = useGetVehiclesQuery(filters);
  
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

  const clearFilters = () => {
    setFilters({
      vehicle_type: '',
      brand: '',
      price_min: 0,
      price_max: 100000000,
      year_min: 1990,
      year_max: 2025,
      search: '',
      sort: 'newest'
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#000' }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        color: 'white',
        py: 4
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ 
            fontSize: isMobile ? '2rem' : '3rem', 
            fontWeight: 700, 
            mb: 2,
            textAlign: 'center'
          }}>
            Каталог техники
          </Typography>
          
          {/* Search Bar */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 4,
            maxWidth: 600,
            mx: 'auto'
          }}>
            <TextField
              fullWidth
              placeholder="Поиск техники..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#007AFF',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                }
              }}
            />
            <IconButton
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ 
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <FilterList />
            </IconButton>
          </Box>

          {/* Category Chips */}
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                label={`${category.icon} ${category.name}`}
                onClick={() => handleFilterChange('vehicle_type', category.id)}
                variant={filters.vehicle_type === category.id ? 'filled' : 'outlined'}
                sx={{ 
                  background: filters.vehicle_type === category.id ? 'rgba(0, 122, 255, 0.2)' : 'transparent',
                  color: filters.vehicle_type === category.id ? 'white' : '#007AFF',
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Controls */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          color: 'white'
        }}>
          <Typography variant="body1">
            Найдено: {vehiclesData?.count || 0} единиц техники
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  }
                }}
              >
                <MenuItem value="newest">Сначала новые</MenuItem>
                <MenuItem value="oldest">Сначала старые</MenuItem>
                <MenuItem value="price_asc">Цена по возрастанию</MenuItem>
                <MenuItem value="price_desc">Цена по убыванию</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: 1 }}>
              <IconButton
                onClick={() => setViewMode('grid')}
                sx={{ 
                  color: viewMode === 'grid' ? '#007AFF' : 'white',
                  background: viewMode === 'grid' ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                  borderRadius: 0,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <ViewModule />
              </IconButton>
              <IconButton
                onClick={() => setViewMode('list')}
                sx={{ 
                  color: viewMode === 'list' ? '#007AFF' : 'white',
                  background: viewMode === 'list' ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                  borderRadius: 0,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <ViewList />
              </IconButton>
            </Box>
          </Box>

          {/* Products Grid */}
          <Grid container spacing={3}>
            {vehiclesData?.results?.map((vehicle, index) => (
              <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 4 : 12} key={vehicle.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard 
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    sx={viewMode === 'list' ? { display: 'flex', flexDirection: 'row' } : {}}
                  >
                    <CardMedia
                      component="img"
                      height={viewMode === 'list' ? 200 : 250}
                      width={viewMode === 'list' ? 300 : '100%'}
                      image={vehicle.images?.[0]?.image || '/images/placeholder.jpg'}
                      alt={`${vehicle.brand.name} ${vehicle.model.name}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 3, flex: 1 }}>
                      <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>
                        {vehicle.brand.name} {vehicle.model.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                        {vehicle.year} • {vehicle.power} л.с. • {vehicle.mileage.toLocaleString()} км
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                          {vehicle.price.toLocaleString()} ₽
                        </Typography>
                        <Chip 
                          label={vehicle.vehicle_type === 'car' ? 'Автомобиль' : 
                                 vehicle.vehicle_type === 'motorcycle' ? 'Мотоцикл' :
                                 vehicle.vehicle_type === 'boat' ? 'Лодка' :
                                 vehicle.vehicle_type === 'helicopter' ? 'Вертолет' :
                                 vehicle.vehicle_type === 'airplane' ? 'Самолет' : 'Техника'}
                          size="small"
                          sx={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        fullWidth
                        sx={{ 
                          background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Подробнее
                      </Button>
                    </CardContent>
                  </ProductCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Filter Drawer */}
      <FilterDrawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Фильтры</Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Price Range */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Цена</Typography>
            <Slider
              value={[filters.price_min, filters.price_max]}
              onChange={(_, value) => {
                handleFilterChange('price_min', value[0]);
                handleFilterChange('price_max', value[1]);
              }}
              min={0}
              max={100000000}
              step={1000000}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value / 1000000).toFixed(0)}M ₽`}
            />
          </Box>

          {/* Year Range */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Год выпуска</Typography>
            <Slider
              value={[filters.year_min, filters.year_max]}
              onChange={(_, value) => {
                handleFilterChange('year_min', value[0]);
                handleFilterChange('year_max', value[1]);
              }}
              min={1990}
              max={2025}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Clear Filters */}
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{ mt: 2 }}
          >
            Очистить фильтры
          </Button>
        </Box>
      </FilterDrawer>
    </Box>
  );
};

export default VehicleList; 