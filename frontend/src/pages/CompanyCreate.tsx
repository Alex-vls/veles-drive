import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { companiesService } from './services/companies';
import CompanyForm from './components/companies/CompanyForm';

const CompanyCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: FormData) => {
    await companiesService.createCompany(data);
    navigate('/companies');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Добавление автосалона
      </Typography>
      <CompanyForm onSubmit={handleSubmit} onCancel={() => navigate('/companies')} />
    </Box>
  );
};

export default CompanyCreatePage; 