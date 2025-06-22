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
}

const CarCard: React.FC<CarCardProps> = ({
  car,
  onFavoriteToggle,
  onContactClick,
}) => {
  const navigate = useNavigate();

  const handleFavoriteClick = () => {
    onFavoriteToggle?.(car.id);
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
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          borderColor: 'rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Favorite button */}
      <IconButton
        onClick={handleFavoriteClick}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,0,0,0.08)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
            transform: 'scale(1.1)',
          },
        }}
      >
        <FavoriteBorder sx={{ color: '#636366' }} />
      </IconButton>

      {/* Condition badge */}
      <Chip
        label={car.condition === 'new' ? 'Новый' : 'С пробегом'}
        size="small"
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 2,
          backgroundColor: car.condition === 'new' ? '#34C759' : '#FF9500',
          color: 'white',
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: '8px',
        }}
      />

      {/* Car image */}
      <Box
        sx={{
          position: 'relative',
          height: 260,
          backgroundColor: '#F5F5F7',
          overflow: 'hidden',
          borderRadius: '16px 16px 0 0',
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
            <DirectionsCar sx={{ fontSize: 60, color: '#636366' }} />
          </Box>
        )}

        {/* Price badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            px: 3,
            py: 1.5,
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.125rem',
            }}
          >
            {formatPrice(car.price)}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Car name and rating */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1D1D1F',
              mb: 1,
              lineHeight: 1.3,
            }}
          >
            {car.brand} {car.model}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Rating
              value={car.rating}
              precision={0.1}
              size="small"
              readOnly
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#FF9500',
                },
                '& .MuiRating-iconEmpty': {
                  color: '#E5E5EA',
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: '#636366',
                fontWeight: 500,
              }}
            >
              {car.rating.toFixed(1)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#8E8E93',
              }}
            >
              ({car.reviews} отзывов)
            </Typography>
          </Box>
        </Box>

        {/* Tags */}
        {car.tags && car.tags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {car.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{
                    backgroundColor: '#F5F5F7',
                    color: '#636366',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderRadius: '6px',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Specifications */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#8E8E93',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: 2,
              display: 'block',
            }}
          >
            Характеристики
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ fontSize: 16, color: '#0071E3' }} />
              <Typography
                variant="body2"
                sx={{
                  color: '#636366',
                  fontWeight: 500,
                }}
              >
                {car.year}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Speed sx={{ fontSize: 16, color: '#0071E3' }} />
              <Typography
                variant="body2"
                sx={{
                  color: '#636366',
                  fontWeight: 500,
                }}
              >
                {formatMileage(car.mileage)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalGasStation sx={{ fontSize: 16, color: '#0071E3' }} />
              <Typography
                variant="body2"
                sx={{
                  color: '#636366',
                  fontWeight: 500,
                }}
              >
                {car.fuelType}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings sx={{ fontSize: 16, color: '#0071E3' }} />
              <Typography
                variant="body2"
                sx={{
                  color: '#636366',
                  fontWeight: 500,
                }}
              >
                {car.transmission}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Engine */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: '#636366',
              fontWeight: 500,
            }}
          >
            {car.engine}
          </Typography>
        </Box>

        {/* Company info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            backgroundColor: '#F5F5F7',
            borderRadius: '12px',
            mb: 3,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: '#E5E5EA',
            },
          }}
          onClick={handleCompanyClick}
        >
          <Avatar
            src={car.company.logo}
            sx={{
              width: 32,
              height: 32,
              backgroundColor: '#E5E5EA',
            }}
          >
            <Business sx={{ fontSize: 18, color: '#636366' }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#1D1D1F',
                fontWeight: 500,
              }}
            >
              {car.company.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#8E8E93',
              }}
            >
              Поставщик
            </Typography>
          </Box>
          <LocationOn sx={{ fontSize: 16, color: '#0071E3' }} />
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleContactClick}
            sx={{
              background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              '&:hover': {
                background: '#34C759',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Оставить заявку
          </Button>
          <Button
            variant="outlined"
            onClick={handleViewDetails}
            sx={{
              borderColor: '#0071E3',
              color: '#0071E3',
              borderRadius: '12px',
              textTransform: 'none',
              minWidth: 'auto',
              px: 2,
              fontWeight: 600,
              '&:hover': {
                borderColor: '#0051A3',
                backgroundColor: 'rgba(0, 113, 227, 0.05)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Подробнее
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CarCard; 