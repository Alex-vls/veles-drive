import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useGetCompaniesQuery } from '@/services/api';
import CompanyCard from '../components/companies/CompanyCard';
import CompanyFiltersComponent from '../components/companies/CompanyFilters';
import { useAuth } from '../contexts/AuthContext';

const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<any>(null);

  const itemsPerPage = 9;

  // Получаем данные через API
  const { data: companiesData, isLoading, error } = useGetCompaniesQuery({
    page,
    page_size: itemsPerPage,
    ...filters
  });

  const companies = companiesData?.results || [];
  const totalPages = companiesData?.count ? Math.ceil(companiesData.count / itemsPerPage) : 1;

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleDeleteClick = (company: any) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // TODO: Implement delete functionality
    console.log('Delete company:', companyToDelete);
    setDeleteDialogOpen(false);
    setCompanyToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCompanyToDelete(null);
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Ошибка при загрузке списка компаний</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Компании
        </Typography>
        {user && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/companies/create')}
          >
            Добавить компанию
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <CompanyFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </Grid>
        
        <Grid item xs={12} md={9}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : companies.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Компании не найдены
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {companies.map((company) => (
                  <Grid item xs={12} sm={6} md={4} key={company.id}>
                    <CompanyCard
                      company={company}
                      onEdit={user ? () => navigate(`/companies/${company.id}/edit`) : undefined}
                      onDelete={user ? () => handleDeleteClick(company) : undefined}
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
            Вы уверены, что хотите удалить компанию "{companyToDelete?.name}"?
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

export default CompaniesPage; 