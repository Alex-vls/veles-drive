import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import CarForm from './components/cars/CarForm';
import { carsService } from './services/cars';

const CarCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: FormData) => {
    await carsService.createCar(data);
    navigate('/cars');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Добавить автомобиль
      </Typography>
      <CarForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/cars')}
      />
    </Box>
  );
};

export default CarCreatePage; 