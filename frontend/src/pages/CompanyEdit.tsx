import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { companiesService } from './services/companies';
import CompanyForm from './components/companies/CompanyForm';
import { useAuth } from './contexts/AuthContext';

const CompanyEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await companiesService.getCompany(Number(id));
        
        if (user?.id !== data.owner) {
          setError('У вас нет прав для редактирования этой компании');
          return;
        }
        
        setCompany(data);
      } catch (err) {
        setError('Ошибка при загрузке данных компании');
        console.error('Error fetching company:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, user]);

  const handleSubmit = async (data: FormData) => {
    try {
      await companiesService.updateCompany(Number(id), data);
      navigate(`/companies/${id}`);
    } catch (err) {
      setError('Ошибка при сохранении данных компании');
      console.error('Error updating company:', err);
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
      <Typography variant="h4" gutterBottom>
        Редактирование автосалона
      </Typography>
      <CompanyForm
        initialData={company}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/companies/${id}`)}
      />
    </Box>
  );
};

export default CompanyEditPage; 