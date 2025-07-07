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
  Business,
  LocationOn,
  Phone,
  Email,
  Star,
  Verified,
  DirectionsCar,
} from '@mui/icons-material';
import { Company } from '../../types';

interface CompanyCardProps {
  company: Company;
  onFavoriteToggle?: (companyId: string) => void;
  onContactClick?: (companyId: string) => void;
  onFavorite?: (companyId: number) => void;
  isFavorite?: boolean;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onFavoriteToggle,
  onContactClick,
  onFavorite,
  isFavorite = false,
}) => {
  const navigate = useNavigate();

  const handleFavoriteClick = () => {
    if (onFavorite) {
      onFavorite(company.id);
    } else if (onFavoriteToggle) {
      onFavoriteToggle(company.id);
    }
  };

  const handleContactClick = () => {
    onContactClick?.(company.id);
  };

  const handleViewDetails = () => {
    navigate(`/companies/${company.id}`);
  };

  const handleViewCars = () => {
    navigate(`/cars?company=${company.id}`);
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

      {/* Verified badge */}
      {company.is_verified && (
        <Chip
          icon={<Verified />}
          label="Проверенный"
          size="small"
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 2,
            backgroundColor: '#34C759',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderRadius: '12px',
            px: 2,
            py: 1,
          }}
        />
      )}

      {/* Company image */}
      <Box
        sx={{
          position: 'relative',
          height: 200,
          backgroundColor: '#F5F5F7',
          overflow: 'hidden',
          borderRadius: '20px 20px 0 0',
        }}
      >
        {company.banner_image ? (
          <CardMedia
            component="img"
            image={company.banner_image}
            alt={company.name}
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
            <Business sx={{ fontSize: 60, color: '#636366' }} />
          </Box>
        )}

        {/* Company logo overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: 20,
            width: 80,
            height: 80,
            borderRadius: '16px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '3px solid white',
          }}
        >
          {company.logo ? (
            <Box
              component="img"
              src={company.logo}
              alt={company.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '12px',
              }}
            />
          ) : (
            <Business sx={{ fontSize: 40, color: '#636366' }} />
          )}
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 4, pt: 6 }}>
        {/* Company name and rating */}
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
            {company.name}
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              color: '#636366',
              mb: 2,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LocationOn sx={{ fontSize: 20, color: '#007AFF', mr: 1 }} />
            {company.location}
          </Typography>
          
          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating
              value={company.rating || 0}
              readOnly
              size="small"
              sx={{ mr: 1 }}
            />
            <Typography variant="body2" sx={{ color: '#636366' }}>
              {company.rating || 0} ({company.reviews_count || 0} отзывов)
            </Typography>
          </Box>
        </Box>

        {/* Company description */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: '#636366',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {company.description || 'Описание компании отсутствует'}
          </Typography>
        </Box>

        {/* Company stats */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DirectionsCar sx={{ fontSize: 20, color: '#007AFF', mr: 1 }} />
            <Typography variant="body2" sx={{ color: '#636366' }}>
              {company.cars_count || 0} автомобилей в продаже
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Star sx={{ fontSize: 20, color: '#FF9500', mr: 1 }} />
            <Typography variant="body2" sx={{ color: '#636366' }}>
              {company.years_experience || 0} лет на рынке
            </Typography>
          </Box>
        </Box>

        {/* Company features */}
        {company.features && company.features.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {company.features.slice(0, 3).map((feature, index) => (
                <Chip
                  key={index}
                  label={feature.name}
                  size="small"
                  sx={{
                    backgroundColor: '#F5F5F7',
                    color: '#636366',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderRadius: '8px',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

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
            onClick={handleViewCars}
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
            Авто
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CompanyCard; 