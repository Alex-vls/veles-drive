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
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Company } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessIcon from '@mui/icons-material/Business';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import StarIcon from '@mui/icons-material/Star';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface Props {
  company: Company;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
}

const CompanyCard: React.FC<Props> = ({ company, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = user?.id === company.owner?.id;

  const handleClick = () => {
    navigate(`/companies/${company.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(company);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(company);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dealer': return '#0071E3';
      case 'service': return '#34C759';
      case 'insurance': return '#FF9500';
      case 'auction': return '#AF52DE';
      default: return '#636366';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'dealer': return 'Дилер';
      case 'service': return 'Сервис';
      case 'insurance': return 'Страхование';
      case 'auction': return 'Аукцион';
      default: return 'Компания';
    }
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
      {/* Изображение компании */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={company.logo || '/images/company-placeholder.jpg'}
          alt={company.name}
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

        {/* Статус компании */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            display: 'flex',
            gap: 1,
          }}
        >
          <Chip
            label={getTypeLabel(company.type || 'company')}
            size="small"
            sx={{
              backgroundColor: getTypeColor(company.type || 'company'),
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
          {company.is_verified && (
            <Chip
              icon={<VerifiedIcon />}
              label="Проверенный"
              size="small"
              sx={{
                backgroundColor: '#34C759',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          )}
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
        {/* Заголовок и рейтинг */}
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
            {company.name}
          </Typography>
          
          {/* Рейтинг */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Rating 
              value={company.rating} 
              readOnly 
              size="small"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#FF9500',
                },
              }}
            />
            <Typography variant="body2" sx={{ color: '#636366', fontWeight: 500 }}>
              {company.rating.toFixed(1)}
            </Typography>
            <Typography variant="body2" sx={{ color: '#636366' }}>
              ({company.reviews} отзывов)
            </Typography>
          </Box>

          {/* Прогресс-бар рейтинга */}
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={(company.rating / 5) * 100}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: '#F5F5F7',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#FF9500',
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Box>

        {/* Описание */}
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

        {/* Контактная информация */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon fontSize="small" sx={{ color: '#636366' }} />
              <Typography variant="body2" sx={{ color: '#636366', fontWeight: 500 }}>
                {company.address}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon fontSize="small" sx={{ color: '#636366' }} />
              <Typography variant="body2" sx={{ color: '#636366', fontWeight: 500 }}>
                {company.phone}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon fontSize="small" sx={{ color: '#636366' }} />
              <Typography variant="body2" sx={{ color: '#636366', fontWeight: 500 }}>
                {company.email}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Статистика */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
              <DirectionsCarIcon fontSize="small" sx={{ color: '#0071E3' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1D1D1F' }}>
                {company.carsCount || 0}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#636366' }}>
              Автомобилей
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
              <BusinessIcon fontSize="small" sx={{ color: '#34C759' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1D1D1F' }}>
                {company.established || 'N/A'}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#636366' }}>
              Год основания
            </Typography>
          </Box>
        </Box>

        {/* Специализации */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {company.specialties?.slice(0, 3).map((specialty, index) => (
            <Chip
              key={index}
              size="small"
              label={specialty}
              sx={{
                backgroundColor: '#F5F5F7',
                color: '#636366',
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            />
          ))}
          {company.specialties && company.specialties.length > 3 && (
            <Chip
              size="small"
              label={`+${company.specialties.length - 3}`}
              sx={{
                backgroundColor: '#0071E3',
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

export default CompanyCard; 