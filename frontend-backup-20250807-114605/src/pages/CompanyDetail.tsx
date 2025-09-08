import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Rating,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import { companiesService } from './services/companies';
import { useAuth } from './contexts/AuthContext';
import CarCard from './components/cars/CarCard';
import ReviewList from './components/reviews/ReviewList';
import ReviewForm from './components/reviews/ReviewForm';

const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [companyData, carsData] = await Promise.all([
        companiesService.getCompany(Number(id)),
        companiesService.getCompanyCars(Number(id)),
      ]);
      setCompany(companyData);
      setCars(carsData.results);
    } catch (err) {
      setError('Ошибка при загрузке данных компании');
      console.error('Error fetching company data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  const handleEdit = () => {
    navigate(`/companies/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await companiesService.deleteCompany(Number(id));
      navigate('/companies');
    } catch (err) {
      setError('Ошибка при удалении компании');
      console.error('Error deleting company:', err);
    }
  };

  const handleReviewSubmit = async (data: { rating: number; comment: string }) => {
    try {
      await companiesService.createCompanyReview(Number(id), data);
      fetchCompanyData();
    } catch (err) {
      setError('Ошибка при добавлении отзыва');
      console.error('Error creating review:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {company.logo && (
              <img
                src={company.logo}
                alt={company.name}
                style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
              />
            )}
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {company.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Rating value={company.rating} precision={0.5} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    ({company.rating.toFixed(1)})
                  </Typography>
                  {company.is_verified && (
                    <Chip label="Проверена" color="success" size="small" />
                  )}
                </Box>
              </Box>
              {user?.id === company.owner && (
                <Box>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{ mr: 1 }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Удалить
                  </Button>
                </Box>
              )}
            </Box>

            <Typography variant="body1" paragraph>
              {company.description}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="action" />
                <Typography>
                  {company.city}, {company.address}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon color="action" />
                <Typography>{company.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon color="action" />
                <Typography>{company.email}</Typography>
              </Box>
              {company.website && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LanguageIcon color="action" />
                  <Typography>
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      {company.website}
                    </a>
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Автомобили в продаже
      </Typography>
      {cars.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          В данный момент нет автомобилей в продаже
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {cars.map((car) => (
            <Grid item xs={12} sm={6} md={4} key={car.id}>
              <CarCard car={car} />
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Отзывы
        </Typography>
        {user && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <ReviewForm onSubmit={handleReviewSubmit} />
          </Paper>
        )}
        <ReviewList
          reviews={company.reviews}
          onDelete={user?.id === company.owner ? undefined : undefined}
        />
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот автосалон? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDelete} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyDetailPage; 