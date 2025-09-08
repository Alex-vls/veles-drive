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
import { useGetVehiclesQuery } from '@/services/api';
import CarFiltersComponent from '../components/cars/CarFilters';
import CarCard from '../components/cars/CarCard';
import { useAuth } from '../contexts/AuthContext';
import AddIcon from '@mui/icons-material/Add';

const CarsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);

  const itemsPerPage = 12;

  // Получаем данные через API
  const { data: vehiclesData, isLoading, error } = useGetVehiclesQuery({
    page,
    page_size: itemsPerPage,
    vehicle_type: 'car',
    ...filters
  });

  const cars = vehiclesData?.results || [];
  const totalPages = vehiclesData?.count ? Math.ceil(vehiclesData.count / itemsPerPage) : 1;

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleDeleteClick = (car: any) => {
    setSelectedCar(car);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // TODO: Implement delete functionality
    console.log('Delete car:', selectedCar);
    setDeleteDialogOpen(false);
    setSelectedCar(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCar(null);
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Ошибка загрузки автомобилей</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Автомобили
        </Typography>
        {user && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/cars/create')}
          >
            Добавить автомобиль
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <CarFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </Grid>
        
        <Grid item xs={12} md={9}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : cars.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Автомобили не найдены
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {cars.map((car) => (
                  <Grid item xs={12} sm={6} md={4} key={car.id}>
                    <CarCard
                      car={car}
                      onEdit={user ? () => navigate(`/cars/${car.id}/edit`) : undefined}
                      onDelete={user ? () => handleDeleteClick(car) : undefined}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить автомобиль "{selectedCar?.brand?.name} {selectedCar?.model?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CarsPage; 