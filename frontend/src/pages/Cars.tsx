import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { mockCars, Car } from '../data/mockData';
import CarFiltersComponent from '../components/cars/CarFilters';
import CarCard from '../components/cars/CarCard';
import { useAuth } from '../contexts/AuthContext';
import AddIcon from '@mui/icons-material/Add';

const CarsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const itemsPerPage = 12;

  const fetchCars = async () => {
    setLoading(true);
    try {
      // Используем тестовые данные вместо API
      setCars(mockCars);
    } catch (err) {
      setError('Ошибка загрузки автомобилей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    // Фильтрация автомобилей
    let filtered = [...cars];
    
    if (filters.brand) {
      filtered = filtered.filter(car => 
        car.brand.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }
    
    if (filters.model) {
      filtered = filtered.filter(car => 
        car.model.toLowerCase().includes(filters.model.toLowerCase())
      );
    }
    
    if (filters.condition) {
      filtered = filtered.filter(car => car.condition === filters.condition);
    }
    
    if (filters.fuelType) {
      filtered = filtered.filter(car => car.fuelType === filters.fuelType);
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(car => car.price >= filters.minPrice);
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(car => car.price <= filters.maxPrice);
    }
    
    if (filters.minYear) {
      filtered = filtered.filter(car => car.year >= filters.minYear);
    }
    
    if (filters.maxYear) {
      filtered = filtered.filter(car => car.year <= filters.maxYear);
    }

    setFilteredCars(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1);
  }, [cars, filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters({});
  };

  const handleEdit = (car: Car) => {
    navigate(`/cars/${car.id}/edit`);
  };

  const handleDelete = (car: Car) => {
    setSelectedCar(car);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCar) return;

    try {
      // В реальном приложении здесь был бы API вызов
      setCars(prev => prev.filter(car => car.id !== selectedCar.id));
      setDeleteDialogOpen(false);
      setSelectedCar(null);
    } catch (err) {
      setError('Ошибка при удалении автомобиля');
    }
  };

  // Получаем автомобили для текущей страницы
  const paginatedCars = filteredCars.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F5F5F7' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h3"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#1D1D1F',
            }}
          >
            Автомобили
          </Typography>
          {user?.company && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/cars/create')}
              sx={{
                backgroundColor: '#0071E3',
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#007AFF',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Добавить автомобиль
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <CarFiltersComponent
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleFilterReset}
        />

        {filteredCars.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#636366',
                mb: 2,
              }}
            >
              Автомобили не найдены
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#636366',
              }}
            >
              Попробуйте изменить параметры поиска
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedCars.map((car) => (
                <Grid item key={car.id} xs={12} sm={6} md={4} lg={3}>
                  <CarCard
                    car={car}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: '8px',
                      fontWeight: 600,
                    },
                    '& .Mui-selected': {
                      backgroundColor: '#0071E3',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#007AFF',
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            <Typography>
              Вы уверены, что хотите удалить автомобиль {selectedCar?.brand} {selectedCar?.model}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={confirmDelete} color="error">
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CarsPage; 