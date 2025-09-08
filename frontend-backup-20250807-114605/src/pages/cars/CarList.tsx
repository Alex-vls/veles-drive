import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Stack,
  Pagination,
} from '@mui/material';
import { useGetCarsQuery } from '../../services/api';
import Filters from '../../components/Filters';
import Sort from '../../components/Sort';
import { Car } from '../../types';

const CarList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    year_min: '',
    year_max: '',
    price_min: '',
    price_max: '',
    transmission: '',
    fuel_type: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const { data, isLoading, error } = useGetCarsQuery({
    page,
    ...filters,
  });

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  if (isLoading) {
    return (
      <Container>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">Ошибка при загрузке автомобилей</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Автомобили
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Filters
              type="car"
              filters={filters}
              onChange={handleFilterChange}
              onReset={() => setFilters({
                brand: '',
                model: '',
                year_min: '',
                year_max: '',
                price_min: '',
                price_max: '',
                transmission: '',
                fuel_type: '',
                sort_by: 'created_at',
                sort_order: 'desc',
              })}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 3 }}>
              <Sort
                type="car"
                filters={filters}
                onSortChange={handleFilterChange}
              />
            </Box>
            <Grid container spacing={3}>
              {data?.results.map((car: Car) => (
                <Grid item xs={12} sm={6} md={4} key={car.id}>
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
                      alt={car.brand.name + ' ' + car.model}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2">
                        {car.brand.name} {car.model}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {car.year} • {car.mileage} км
                      </Typography>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {car.price.toLocaleString()} ₽
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip
                          label={car.transmission === 'manual' ? 'МКПП' : 'АКПП'}
                          size="small"
                        />
                        <Chip
                          label={car.fuel_type}
                          size="small"
                        />
                        <Chip
                          label={car.body_type}
                          size="small"
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {data && data.count > 0 && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={Math.ceil(data.count / 10)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CarList; 