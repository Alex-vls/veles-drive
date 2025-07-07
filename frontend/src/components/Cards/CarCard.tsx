import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Rating,
  Avatar,
  Grid,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  DirectionsCar,
  Speed,
  LocalGasStation,
  Settings,
  CalendarToday,
  LocationOn,
  Business,
  Star,
} from '@mui/icons-material';
import { Car } from '../../types';

interface CarCardProps {
  car: Car;
  onFavoriteToggle?: (carId: string) => void;
  onContactClick?: (carId: string) => void;
  onFavorite?: (carId: number) => void;
  isFavorite?: boolean;
}

const CarCard: React.FC<CarCardProps> = ({
  car,
  onFavoriteToggle,
  onContactClick,
  onFavorite,
  isFavorite = false,
}) => {
  const navigate = useNavigate();

  const handleFavoriteClick = () => {
    if (onFavorite) {
      onFavorite(car.id);
    } else if (onFavoriteToggle) {
      onFavoriteToggle(car.id);
    }
  };

  const handleContactClick = () => {
    onContactClick?.(car.id);
  };

  const handleViewDetails = () => {
    navigate(`/cars/${car.id}`);
  };

  const handleCompanyClick = () => {
    navigate(`/companies/${car.company.id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ru-RU').format(mileage) + ' км';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        borderRadius: '20px',
        border: '1px solid rgba(0,0,0,0.08)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        '&:hover': {
          transform: 'translateY(-12px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          borderColor: 'rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Favorite button */}
      <IconButton
        onClick={handleFavoriteClick}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,0,0,0.08)',
          width: 48,
          height: 48,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
            transform: 'scale(1.1)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          },
        }}
      >
        {isFavorite ? (
          <Favorite sx={{ color: '#FF3B30', fontSize: 24 }} />
        ) : (
          <FavoriteBorder sx={{ color: '#636366', fontSize: 24 }} />
        )}
      </IconButton>

      {/* Condition badge */}
      <Chip
        label={car.condition === 'new' ? 'Новый' : 'С пробегом'}
        size="small"
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 2,
          backgroundColor: car.condition === 'new' ? '#34C759' : '#FF9500',
          color: 'white',
          fontWeight: 600,
          fontSize: '0.875rem',
          borderRadius: '12px',
          px: 2,
          py: 1,
        }}
      />

      {/* Car image */}
      <Box
        sx={{
          position: 'relative',
          height: 320,
          backgroundColor: '#F5F5F7',
          overflow: 'hidden',
          borderRadius: '20px 20px 0 0',
        }}
      >
        {car.main_image ? (
          <CardMedia
            component="img"
            image={car.main_image}
            alt={`${car.brand} ${car.model}`}
            sx={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              backgroundColor: '#E5E5EA',
            }}
          >
            <DirectionsCar sx={{ fontSize: 80, color: '#636366' }} />
          </Box>
        )}

        {/* Price badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            px: 4,
            py: 2,
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            {formatPrice(car.price)}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 4 }}>
        {/* Car name and rating */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1D1D1F',
              mb: 1,
              lineHeight: 1.3,
              fontSize: '1.5rem',
            }}
          >
            {car.brand} {car.model}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#636366',
              mb: 2,
              fontSize: '1rem',
            }}
          >
            {car.year} • {formatMileage(car.mileage)}
          </Typography>
          
          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating
              value={car.rating || 0}
              readOnly
              size="small"
              sx={{ mr: 1 }}
            />
            <Typography variant="body2" sx={{ color: '#636366' }}>
              {car.rating || 0} ({car.reviews_count || 0} отзывов)
            </Typography>
          </Box>
        </Box>

        {/* Car specs */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Speed sx={{ fontSize: 20, color: '#007AFF', mr: 1 }} />
                <Typography variant="body2" sx={{ color: '#636366' }}>
                  {car.engine_power} л.с.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalGasStation sx={{ fontSize: 20, color: '#34C759', mr: 1 }} />
                <Typography variant="body2" sx={{ color: '#636366' }}>
                  {car.fuel_type}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Settings sx={{ fontSize: 20, color: '#FF9500', mr: 1 }} />
                <Typography variant="body2" sx={{ color: '#636366' }}>
                  {car.transmission}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarToday sx={{ fontSize: 20, color: '#AF52DE', mr: 1 }} />
                <Typography variant="body2" sx={{ color: '#636366' }}>
                  {car.year}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Company info */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              bgcolor: '#F5F5F7',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#E5E5EA',
              },
            }}
            onClick={handleCompanyClick}
          >
            <Avatar
              src={car.company.logo}
              sx={{ width: 40, height: 40, mr: 2 }}
            >
              <Business />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1D1D1F' }}>
                {car.company.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#636366' }}>
                {car.company.location}
              </Typography>
            </Box>
            <LocationOn sx={{ fontSize: 20, color: '#636366' }} />
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleViewDetails}
            sx={{
              bgcolor: '#007AFF',
              color: 'white',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '12px',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#0056CC',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 15px rgba(0, 122, 255, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Подробнее
          </Button>
          <Button
            variant="outlined"
            onClick={handleContactClick}
            sx={{
              borderColor: '#007AFF',
              color: '#007AFF',
              py: 1.5,
              px: 3,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '12px',
              textTransform: 'none',
              minWidth: 'auto',
              '&:hover': {
                bgcolor: '#007AFF',
                color: 'white',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Связаться
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CarCard; 