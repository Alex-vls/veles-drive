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
  Avatar,
  Rating,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Phone,
  LocationOn,
  Star,
  Verified,
  Favorite,
  FavoriteBorder,
  DirectionsCar,
  Business,
  CheckCircle,
} from '@mui/icons-material';

interface CompanyCardProps {
  company: {
    id: number;
    name: string;
    logo?: string;
    description: string;
    rating: number;
    reviewCount: number;
    phone: string;
    address: string;
    isVerified: boolean;
    isFavorite?: boolean;
    advantages: string[];
    carCount: number;
    type: 'dealer' | 'service' | 'insurance';
  };
  onFavoriteToggle?: (companyId: number) => void;
  onContactClick?: (companyId: number) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onFavoriteToggle,
  onContactClick,
}) => {
  const navigate = useNavigate();

  const handleFavoriteClick = () => {
    onFavoriteToggle?.(company.id);
  };

  const handleContactClick = () => {
    onContactClick?.(company.id);
  };

  const handleViewDetails = () => {
    navigate(`/companies/${company.id}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dealer':
        return '#0071E3';
      case 'service':
        return '#34C759';
      case 'insurance':
        return '#FF9500';
      default:
        return '#636366';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'dealer':
        return 'Дилер';
      case 'service':
        return 'Сервис';
      case 'insurance':
        return 'Страхование';
      default:
        return 'Компания';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 32px rgba(60,60,67,0.12)',
        },
      }}
    >
      {/* Favorite button */}
      <IconButton
        onClick={handleFavoriteClick}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
          },
        }}
      >
        {company.isFavorite ? (
          <Favorite sx={{ color: '#FF3B30' }} />
        ) : (
          <FavoriteBorder sx={{ color: '#636366' }} />
        )}
      </IconButton>

      {/* Logo section */}
      <Box
        sx={{
          position: 'relative',
          height: 200,
          backgroundColor: '#F5F5F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {company.logo ? (
          <CardMedia
            component="img"
            image={company.logo}
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
              width: 80,
              height: 80,
              borderRadius: '16px',
              backgroundColor: '#E5E5EA',
            }}
          >
            <Business sx={{ fontSize: 40, color: '#636366' }} />
          </Box>
        )}

        {/* Verification badge */}
        {company.isVerified && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'rgba(52, 199, 89, 0.9)',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <Verified sx={{ fontSize: 16 }} />
            Верифицирована
          </Box>
        )}

        {/* Type badge */}
        <Chip
          label={getTypeLabel(company.type)}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            backgroundColor: getTypeColor(company.type),
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Company name and rating */}
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
            {company.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Rating
              value={company.rating}
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
              {company.rating.toFixed(1)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#8E8E93',
              }}
            >
              ({company.reviewCount} отзывов)
            </Typography>
          </Box>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: '#636366',
            mb: 3,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {company.description}
        </Typography>

        {/* Advantages */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#8E8E93',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: 1,
              display: 'block',
            }}
          >
            Преимущества
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {company.advantages.slice(0, 3).map((advantage, index) => (
              <Chip
                key={index}
                label={advantage}
                size="small"
                icon={<CheckCircle sx={{ fontSize: 16 }} />}
                sx={{
                  backgroundColor: '#F5F5F7',
                  color: '#636366',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    color: '#34C759',
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Contact info */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Phone sx={{ fontSize: 16, color: '#0071E3' }} />
            <Typography
              variant="body2"
              sx={{
                color: '#636366',
                fontWeight: 500,
              }}
            >
              {company.phone}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ fontSize: 16, color: '#0071E3' }} />
            <Typography
              variant="body2"
              sx={{
                color: '#636366',
                fontSize: '0.875rem',
              }}
            >
              {company.address}
            </Typography>
          </Box>
        </Box>

        {/* Car count */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <DirectionsCar sx={{ fontSize: 16, color: '#0071E3' }} />
          <Typography
            variant="body2"
            sx={{
              color: '#636366',
              fontWeight: 500,
            }}
          >
            {company.carCount} автомобилей в наличии
          </Typography>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleContactClick}
            sx={{
              background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
              '&:hover': {
                background: '#34C759',
              },
              fontWeight: 600,
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
              minWidth: 'auto',
              px: 2,
              '&:hover': {
                borderColor: '#0051A3',
                backgroundColor: 'rgba(0, 113, 227, 0.05)',
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

export default CompanyCard; 