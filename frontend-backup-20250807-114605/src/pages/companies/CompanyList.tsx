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
  Rating,
} from '@mui/material';
import { useGetCompaniesQuery } from '../../services/api';
import Filters from '../../components/Filters';
import Sort from '../../components/Sort';
import { Company } from '../../types';

const CompanyList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    city: '',
    is_verified: '',
    rating: '',
    sort_by: 'rating',
    sort_order: 'desc',
  });

  const { data, isLoading, error } = useGetCompaniesQuery({
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
        <Typography color="error">Ошибка при загрузке компаний</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Компании
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Filters
              type="company"
              filters={filters}
              onChange={handleFilterChange}
              onReset={() => setFilters({
                city: '',
                is_verified: '',
                rating: '',
                sort_by: 'rating',
                sort_order: 'desc',
              })}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 3 }}>
              <Sort
                type="company"
                filters={filters}
                onSortChange={handleFilterChange}
              />
            </Box>
            <Grid container spacing={3}>
              {data?.results.map((company: Company) => (
                <Grid item xs={12} sm={6} md={4} key={company.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/companies/${company.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={company.logo || '/images/company-placeholder.jpg'}
                      alt={company.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2">
                        {company.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {company.city}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={company.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({company.rating})
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {company.is_verified && (
                          <Chip
                            label="Проверенная"
                            color="success"
                            size="small"
                          />
                        )}
                        <Chip
                          label={`${company.cars_count} автомобилей`}
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

export default CompanyList; 