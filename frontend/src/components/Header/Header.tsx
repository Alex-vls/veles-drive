import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Chip,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BusinessIcon from '@mui/icons-material/Business';
import ArticleIcon from '@mui/icons-material/Article';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '@/contexts/AuthContext';

const pages = [
  { title: 'О нас', path: '/about', icon: <BusinessIcon /> },
  { title: 'Компании', path: '/companies', icon: <BusinessIcon /> },
  { title: 'Авто', path: '/cars', icon: <DirectionsCarIcon /> },
  { title: 'Новости', path: '/news', icon: <ArticleIcon /> },
];

const Header: React.FC = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
  };

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid #E5E5EA' : 'none',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '72px' }}>
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              mr: 4,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0071E3 0%, #007AFF 100%)',
                mr: 2,
                boxShadow: '0 4px 16px rgba(0, 113, 227, 0.3)',
              }}
            >
              <DirectionsCarIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1D1D1F 0%, #0071E3 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              VELES AUTO
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.path}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{
                  my: 2,
                  mx: 1,
                  color: isActivePage(page.path) ? '#0071E3' : '#1D1D1F',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontWeight: isActivePage(page.path) ? 600 : 500,
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 113, 227, 0.05)',
                    color: '#0071E3',
                  },
                  '&::after': isActivePage(page.path) ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '3px',
                    backgroundColor: '#0071E3',
                    borderRadius: '2px',
                  } : {},
                }}
              >
                {page.icon}
                {page.title}
              </Button>
            ))}
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notifications */}
            {isAuthenticated && (
              <Tooltip title="Уведомления">
                <IconButton
                  sx={{
                    color: '#1D1D1F',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 113, 227, 0.05)',
                    },
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <Box>
                <Tooltip title="Открыть меню">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar 
                      alt={user?.username} 
                      src={user?.avatar}
                      sx={{
                        width: 40,
                        height: 40,
                        border: '2px solid #E5E5EA',
                        '&:hover': {
                          borderColor: '#0071E3',
                        },
                      }}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  PaperProps={{
                    sx: {
                      borderRadius: '16px',
                      boxShadow: '0 8px 32px rgba(60,60,67,0.12)',
                      border: '1px solid #E5E5EA',
                      minWidth: 200,
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate('/profile');
                    }}
                    sx={{
                      py: 2,
                      px: 3,
                      '&:hover': {
                        backgroundColor: '#F5F5F7',
                      },
                    }}
                  >
                    <Typography>Профиль</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate('/settings');
                    }}
                    sx={{
                      py: 2,
                      px: 3,
                      '&:hover': {
                        backgroundColor: '#F5F5F7',
                      },
                    }}
                  >
                    <Typography>Настройки</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      py: 2,
                      px: 3,
                      color: '#FF3B30',
                      '&:hover': {
                        backgroundColor: '#FFF5F5',
                      },
                    }}
                  >
                    <Typography>Выйти</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  sx={{
                    borderColor: '#0071E3',
                    color: '#0071E3',
                    '&:hover': {
                      borderColor: '#0051A3',
                      backgroundColor: 'rgba(0, 113, 227, 0.05)',
                    },
                  }}
                >
                  Войти
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #0071E3 0%, #007AFF 100%)',
                    '&:hover': {
                      background: '#0071E3',
                    },
                  }}
                >
                  Регистрация
                </Button>
              </Box>
            )}

            {/* Mobile menu button */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                sx={{
                  color: '#1D1D1F',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 113, 227, 0.05)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
                PaperProps={{
                  sx: {
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(60,60,67,0.12)',
                    border: '1px solid #E5E5EA',
                    minWidth: 250,
                  },
                }}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page.path}
                    onClick={() => {
                      handleCloseNavMenu();
                      navigate(page.path);
                    }}
                    sx={{
                      py: 2,
                      px: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      color: isActivePage(page.path) ? '#0071E3' : '#1D1D1F',
                      fontWeight: isActivePage(page.path) ? 600 : 400,
                      '&:hover': {
                        backgroundColor: '#F5F5F7',
                      },
                    }}
                  >
                    {page.icon}
                    <Typography>{page.title}</Typography>
                  </MenuItem>
                ))}
                {!isAuthenticated && (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleCloseNavMenu();
                        navigate('/login');
                      }}
                      sx={{
                        py: 2,
                        px: 3,
                        borderTop: '1px solid #E5E5EA',
                        mt: 1,
                      }}
                    >
                      <Typography>Войти</Typography>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleCloseNavMenu();
                        navigate('/register');
                      }}
                      sx={{
                        py: 2,
                        px: 3,
                        color: '#0071E3',
                        fontWeight: 600,
                      }}
                    >
                      <Typography>Регистрация</Typography>
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 