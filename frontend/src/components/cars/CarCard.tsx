import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Rating,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Car } from '@/types';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  car: Car;
  onEdit?: (car: Car) => void;
  onDelete?: (car: Car) => void;
}

const CarCard: React.FC<Props> = ({ car, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = user?.company?.id === car.company.id;

  const handleClick = () => {
    navigate(`/cars/${car.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(car);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(car);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M ₽`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K ₽`;
    }
    return `${price.toLocaleString()} ₽`;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        backgroundColor: 'white',
        borderRadius: '20px',
        border: '1px solid #E5E5EA',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-12px)',
          boxShadow: '0 24px 48px rgba(0, 113, 227, 0.15)',
          borderColor: '#0071E3',
        },
      }}
      onClick={handleClick}
    >
      {/* Изображение автомобиля */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="240"
          image={car.main_image || '/images/car-placeholder.jpg'}
          alt={`${car.brand} ${car.model}`}
          sx={{ 
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
        
        {/* Наложение с градиентом */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            '&:hover': {
              opacity: 1,
            },
          }}
        />

        {/* Кнопки действий */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            gap: 1,
            opacity: 0,
            transition: 'opacity 0.3s ease',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <IconButton
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            <FavoriteIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            <ShareIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Статус автомобиля */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
          }}
        >
          <Chip
            label={car.condition === 'new' ? 'Новый' : 'С пробегом'}
            size="small"
            sx={{
              backgroundColor: car.condition === 'new' ? '#34C759' : '#FF9500',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Кнопки редактирования для владельца */}
        {isOwner && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              display: 'flex',
              gap: 1,
            }}
          >
            <Tooltip title="Редактировать">
              <IconButton
                size="small"
                onClick={handleEdit}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Удалить">
              <IconButton
                size="small"
                color="error"
                onClick={handleDelete}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Заголовок и цена */}
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{
              fontWeight: 700,
              color: '#1D1D1F',
              mb: 1,
              fontSize: '1.25rem',
            }}
          >
            {car.brand} {car.model}
          </Typography>
          <Typography 
            variant="h4" 
            sx={{
              fontWeight: 800,
              color: '#0071E3',
              fontSize: '1.5rem',
            }}
          >
            {formatPrice(car.price)}
          </Typography>
        </Box>

        {/* Основные характеристики */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon fontSize="small" sx={{ color: '#636366' }} />
              <Typography variant="body2" sx={{ color: '#636366', fontWeight: 500 }}>
                {car.year}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpeedIcon fontSize="small" sx={{ color: '#636366' }} />
              <Typography variant="body2" sx={{ color: '#636366', fontWeight: 500 }}>
                {car.mileage.toLocaleString()} км
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalGasStationIcon fontSize="small" sx={{ color: '#636366' }} />
              <Typography variant="body2" sx={{ color: '#636366', fontWeight: 500 }}>
                {car.fuel_type_display}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCarIcon fontSize="small" sx={{ color: '#636366' }} />
              <Typography variant="body2" sx={{ color: '#636366', fontWeight: 500 }}>
                {car.transmission_display}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Рейтинг и отзывы */}
        {car.rating > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Rating value={car.rating} readOnly size="small" />
            <Typography variant="body2" sx={{ color: '#636366' }}>
              ({car.reviews})
            </Typography>
          </Box>
        )}

        {/* Компания */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={car.company.logo}
            sx={{ width: 32, height: 32 }}
          >
            {car.company.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1D1D1F' }}>
              {car.company.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#636366' }}>
              {car.company.city}
            </Typography>
          </Box>
        </Box>

        {/* Теги */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={car.color}
            sx={{
              backgroundColor: '#F5F5F7',
              color: '#636366',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
          <Chip
            size="small"
            label={car.engine}
            sx={{
              backgroundColor: '#F5F5F7',
              color: '#636366',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
          {!car.is_available && (
            <Chip
              size="small"
              label="Продано"
              sx={{
                backgroundColor: '#FF3B30',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CarCard; 