import React, { useState, useEffect } from 'react';
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
import { mockCompanies, Company } from '../data/mockData';
import CompanyCard from '../components/companies/CompanyCard';
import CompanyFiltersComponent from '../components/companies/CompanyFilters';
import { useAuth } from '../contexts/AuthContext';

const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  const itemsPerPage = 9;

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      // Используем тестовые данные вместо API
      console.log('Loading mock companies:', mockCompanies);
      setCompanies(mockCompanies);
    } catch (err) {
      setError('Ошибка при загрузке списка компаний');
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    // Фильтрация компаний
    let filtered = [...companies];
    
    if (filters.type) {
      filtered = filtered.filter(company => company.type === filters.type);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchLower) ||
        company.description.toLowerCase().includes(searchLower) ||
        company.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchLower)
        )
      );
    }

    setFilteredCompanies(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1);
  }, [companies, filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleEdit = (id: string) => {
    navigate(`/companies/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    setCompanyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!companyToDelete) return;

    try {
      // В реальном приложении здесь был бы API вызов
      setCompanies(prev => prev.filter(company => company.id !== companyToDelete));
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    } catch (err) {
      setError('Ошибка при удалении компании');
      console.error('Error deleting company:', err);
    }
  };

  // Получаем компании для текущей страницы
  const paginatedCompanies = filteredCompanies.slice(
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
            Компании
          </Typography>
          {user && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/companies/create')}
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
              Добавить компанию
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <CompanyFiltersComponent
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {filteredCompanies.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#636366',
                mb: 2,
              }}
            >
              Компании не найдены
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
              {paginatedCompanies.map((company) => (
                <Grid item xs={12} sm={6} md={4} key={company.id}>
                  <CompanyCard
                    company={company}
                    onEdit={user?.id === company.owner?.id ? () => handleEdit(company.id) : undefined}
                    onDelete={user?.id === company.owner?.id ? () => handleDelete(company.id) : undefined}
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

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            <Typography>
              Вы уверены, что хотите удалить эту компанию? Это действие нельзя отменить.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
            <Button onClick={confirmDelete} color="error">
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CompaniesPage; 