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
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Article,
  CalendarToday,
  Person,
  Share,
  Bookmark,
  BookmarkBorder,
  ArrowForward,
  AccessTime,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface NewsCardProps {
  news: {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    image?: string;
    author: {
      name: string;
      avatar?: string;
    };
    publishedAt: string;
    category: string;
    readTime: number;
    tags: string[];
    isBookmarked?: boolean;
  };
  onBookmarkToggle?: (newsId: number) => void;
  onShare?: (newsId: number) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({
  news,
  onBookmarkToggle,
  onShare,
}) => {
  const navigate = useNavigate();

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkToggle?.(news.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(news.id);
  };

  const handleReadMore = () => {
    navigate(`/news/${news.id}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'новости':
        return '#0071E3';
      case 'обзоры':
        return '#34C759';
      case 'советы':
        return '#FF9500';
      case 'технологии':
        return '#AF52DE';
      case 'электромобили':
        return '#34C759';
      case 'страхование':
        return '#FF9500';
      case 'новинки':
        return '#0071E3';
      default:
        return '#636366';
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
      onClick={handleReadMore}
    >
      {/* Изображение новости */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="240"
          image={news.image || '/images/news-placeholder.jpg'}
          alt={news.title}
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
            onClick={handleBookmarkClick}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            {news.isBookmarked ? (
              <Bookmark fontSize="small" sx={{ color: '#0071E3' }} />
            ) : (
              <BookmarkBorder fontSize="small" sx={{ color: '#636366' }} />
            )}
          </IconButton>
          <IconButton
            size="small"
            onClick={handleShareClick}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            <Share fontSize="small" sx={{ color: '#636366' }} />
          </IconButton>
        </Box>

        {/* Категория */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
          }}
        >
          <Chip
            label={news.category}
            size="small"
            sx={{
              backgroundColor: getCategoryColor(news.category),
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Время чтения */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
          }}
        >
          <Chip
            icon={<AccessTime fontSize="small" />}
            label={`${news.readTime} мин`}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              color: '#636366',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Заголовок */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1D1D1F',
            mb: 2,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: '1.125rem',
          }}
        >
          {news.title}
        </Typography>

        {/* Краткое описание */}
        <Typography
          variant="body2"
          sx={{
            color: '#636366',
            mb: 3,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: '0.875rem',
          }}
        >
          {news.excerpt}
        </Typography>

        {/* Автор и дата */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar
            src={news.author.avatar}
            sx={{ width: 32, height: 32 }}
          >
            {news.author.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1D1D1F' }}>
              {news.author.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#636366' }}>
              {formatDate(news.publishedAt)}
            </Typography>
          </Box>
        </Box>

        {/* Теги */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {news.tags.slice(0, 3).map((tag, index) => (
            <Chip
              key={index}
              size="small"
              label={tag}
              sx={{
                backgroundColor: '#F5F5F7',
                color: '#636366',
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            />
          ))}
          {news.tags.length > 3 && (
            <Chip
              size="small"
              label={`+${news.tags.length - 3}`}
              sx={{
                backgroundColor: '#0071E3',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>

        {/* Кнопка "Читать далее" */}
        <Button
          variant="text"
          endIcon={<ArrowForward />}
          sx={{
            color: '#0071E3',
            fontWeight: 600,
            textTransform: 'none',
            p: 0,
            '&:hover': {
              backgroundColor: 'transparent',
              color: '#007AFF',
            },
          }}
        >
          Читать далее
        </Button>
      </CardContent>
    </Card>
  );
};

export default NewsCard; 