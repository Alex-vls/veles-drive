import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  Button,
} from '@mui/material';
import { CompanyCard } from './components/companies/CompanyCard';
import { usersService } from './services/users';
import { Company } from './types/company';

interface Props {
  userId: number;
}

const UserCompanies: React.FC<Props> = ({ userId }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await usersService.getUserCompanies(userId, {
        page,
        page_size: 12,
        ordering: '-created_at',
      });
      setCompanies(response.results);
      setTotalPages(Math.ceil(response.count / 12));
    } catch (err) {
      setError('Ошибка при загрузке компаний');
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [userId, page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (companies.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6" gutterBottom>
          У вас пока нет компаний
        </Typography>
        <Button variant="contained" href="/companies/create">
          Добавить компанию
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Мои компании
        </Typography>
        <Button
          variant="contained"
          href="/companies/create"
        >
          Добавить компанию
        </Button>
      </Box>
      <Grid container spacing={3}>
        {companies.map((company) => (
          <Grid item xs={12} sm={6} md={4} key={company.id}>
            <CompanyCard
              company={company}
              onEdit={() => window.location.href = `/companies/${company.id}/edit`}
              onDelete={() => window.location.href = `/companies/${company.id}`}
            />
          </Grid>
        ))}
      </Grid>
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default UserCompanies; 