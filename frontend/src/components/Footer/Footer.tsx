import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Email,
  Phone,
  LocationOn,
  DirectionsCar,
  Business,
  Article,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'VELES AUTO',
      description: 'Лучший агрегатор автомобилей и компаний. Найдите свой идеальный автомобиль с нами.',
      links: [
        { text: 'О нас', path: '/about' },
        { text: 'Контакты', path: '/contact' },
        { text: 'Карьера', path: '/careers' },
        { text: 'Партнеры', path: '/partners' },
      ],
    },
    {
      title: 'Автомобили',
      links: [
        { text: 'Все автомобили', path: '/cars' },
        { text: 'Новые', path: '/cars?condition=new' },
        { text: 'С пробегом', path: '/cars?condition=used' },
        { text: 'Аукционы', path: '/auctions' },
      ],
    },
    {
      title: 'Компании',
      links: [
        { text: 'Все компании', path: '/companies' },
        { text: 'Дилеры', path: '/companies?type=dealer' },
        { text: 'Сервисы', path: '/companies?type=service' },
        { text: 'Страховые', path: '/companies?type=insurance' },
      ],
    },
    {
      title: 'Информация',
      links: [
        { text: 'Новости', path: '/news' },
        { text: 'Статьи', path: '/articles' },
        { text: 'Обзоры', path: '/reviews' },
        { text: 'Советы', path: '/tips' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Facebook />, url: 'https://facebook.com', label: 'Facebook' },
    { icon: <Twitter />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <Instagram />, url: 'https://instagram.com', label: 'Instagram' },
    { icon: <LinkedIn />, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <YouTube />, url: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#F5F5F7',
        borderTop: '1px solid #E5E5EA',
        pt: 8,
        pb: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Main footer content */}
        <Grid container spacing={6} sx={{ mb: 6 }}>
          {footerSections.map((section, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#1D1D1F',
                  mb: 3,
                  fontSize: '1.125rem',
                }}
              >
                {section.title}
              </Typography>
              
              {index === 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#636366',
                    mb: 3,
                    lineHeight: 1.6,
                  }}
                >
                  {section.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      color: '#636366',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 400,
                      transition: 'color 0.2s ease-in-out',
                      '&:hover': {
                        color: '#0071E3',
                      },
                    }}
                  >
                    {link.text}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Contact and social section */}
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: '16px',
            p: 4,
            mb: 4,
            border: '1px solid #E5E5EA',
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#1D1D1F',
                  mb: 2,
                }}
              >
                Свяжитесь с нами
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email sx={{ color: '#0071E3', fontSize: 20 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: '#636366' }}
                  >
                    info@veles-auto.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone sx={{ color: '#0071E3', fontSize: 20 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: '#636366' }}
                  >
                    +7 (800) 555-0123
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn sx={{ color: '#0071E3', fontSize: 20 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: '#636366' }}
                  >
                    Москва, ул. Примерная, 123
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#1D1D1F',
                  mb: 2,
                }}
              >
                Следите за нами
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: '#F5F5F7',
                      border: '1px solid #E5E5EA',
                      color: '#636366',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#0071E3',
                        color: 'white',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 16px rgba(0, 113, 227, 0.3)',
                      },
                    }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ borderColor: '#E5E5EA', mb: 4 }} />

        {/* Bottom section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0071E3 0%, #007AFF 100%)',
              }}
            >
              <DirectionsCar sx={{ color: 'white', fontSize: 18 }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: '#636366',
                fontWeight: 500,
              }}
            >
              © {currentYear} VELES AUTO. Все права защищены.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
            }}
          >
            <Link
              component={RouterLink}
              to="/privacy"
              sx={{
                color: '#636366',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: '#0071E3',
                },
              }}
            >
              Политика конфиденциальности
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              sx={{
                color: '#636366',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: '#0071E3',
                },
              }}
            >
              Условия использования
            </Link>
            <Link
              component={RouterLink}
              to="/sitemap"
              sx={{
                color: '#636366',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: '#0071E3',
                },
              }}
            >
              Карта сайта
            </Link>
          </Box>
        </Box>

        {/* App badges */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Chip
            label="iOS App"
            icon={<Business />}
            sx={{
              backgroundColor: '#F5F5F7',
              border: '1px solid #E5E5EA',
              color: '#636366',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#0071E3',
                color: 'white',
              },
            }}
          />
          <Chip
            label="Android App"
            icon={<DirectionsCar />}
            sx={{
              backgroundColor: '#F5F5F7',
              border: '1px solid #E5E5EA',
              color: '#636366',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#0071E3',
                color: 'white',
              },
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 