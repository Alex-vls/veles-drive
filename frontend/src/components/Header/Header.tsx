import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  useScrollTrigger,
  Slide,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  AccountCircle,
  Favorite,
  Notifications,
  Search,
  Close
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';

// Стилизованные компоненты в стиле Apple
const StyledAppBar = styled(AppBar)<{ scrolled: boolean }>(({ theme, scrolled }) => ({
  background: scrolled 
    ? 'rgba(0, 0, 0, 0.8)' 
    : 'transparent',
  backdropFilter: scrolled ? 'blur(20px)' : 'none',
  boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.3)' : 'none',
  transition: 'all 0.3s ease',
  borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none',
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: 'white',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.9rem',
  padding: theme.spacing(1, 2),
  borderRadius: 20,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-1px)',
  }
}));

const CategoryButton = styled(Button)(({ theme }) => ({
  color: 'white',
  textTransform: 'none',
  fontWeight: 400,
  fontSize: '0.8rem',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 15,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
  }
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
  color: 'white',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: '#007AFF',
  }
}));

interface HeaderProps {
  window?: () => Window;
}

const Header: React.FC<HeaderProps> = ({ window }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const categories = [
    { id: 'car', name: 'Автомобили', icon: '🏎️', path: '/vehicles?type=car' },
    { id: 'motorcycle', name: 'Мотоциклы', icon: '🏍️', path: '/vehicles?type=motorcycle' },
    { id: 'boat', name: 'Лодки', icon: '⛵', path: '/vehicles?type=boat' },
    { id: 'helicopter', name: 'Вертолеты', icon: '🚁', path: '/vehicles?type=helicopter' },
    { id: 'airplane', name: 'Самолеты', icon: '✈️', path: '/vehicles?type=airplane' },
  ];

  const mainNavItems = [
    { name: 'Главная', path: '/' },
    { name: 'Каталог', path: '/vehicles' },
    { name: 'Аукционы', path: '/auctions' },
    { name: 'Лизинг', path: '/leasing' },
    { name: 'Страхование', path: '/insurance' },
    { name: 'О компании', path: '/about' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleProfileMenuClose();
    navigate('/');
  };

  const drawer = (
    <Box sx={{ width: 280, background: '#000', height: '100%', color: 'white' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Logo>VELES AUTO</Logo>
      </Box>
      
      <List sx={{ pt: 2 }}>
        {mainNavItems.map((item) => (
          <ListItem 
            key={item.name}
            button 
            component={RouterLink}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
              },
              '&.active': {
                background: 'rgba(0,122,255,0.2)',
                borderRight: '3px solid #007AFF',
              }
            }}
          >
            <ListItemText 
              primary={item.name}
              sx={{ 
                '& .MuiListItemText-primary': { 
                  color: 'white',
                  fontWeight: location.pathname === item.path ? 600 : 400
                }
              }}
            />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
      
      <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'rgba(255,255,255,0.7)' }}>
        Категории техники
      </Typography>
      
      <List>
        {categories.map((category) => (
          <ListItem 
            key={category.id}
            button 
            component={RouterLink}
            to={category.path}
            onClick={handleDrawerToggle}
            sx={{
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            <ListItemText 
              primary={`${category.icon} ${category.name}`}
              sx={{ 
                '& .MuiListItemText-primary': { 
                  color: 'white',
                  fontSize: '0.9rem'
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <Slide appear={false} direction="down" in={!scrolled}>
        <StyledAppBar position="fixed" scrolled={scrolled}>
          <Container maxWidth="xl">
            <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
              {/* Logo */}
              <Logo onClick={() => navigate('/')}>
                VELES AUTO
              </Logo>

              {/* Desktop Navigation */}
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* Main Navigation */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {mainNavItems.map((item) => (
                      <NavButton
                        key={item.name}
                        component={RouterLink}
                        to={item.path}
                        sx={{
                          background: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                        }}
                      >
                        {item.name}
                      </NavButton>
                    ))}
                  </Box>

                  {/* Category Navigation */}
                  <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                    {categories.map((category) => (
                      <CategoryButton
                        key={category.id}
                        component={RouterLink}
                        to={category.path}
                        size="small"
                      >
                        {category.icon}
                      </CategoryButton>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Right Side Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  color="inherit"
                  onClick={() => navigate('/search')}
                  sx={{ color: 'white' }}
                >
                  <Search />
                </IconButton>

                {isAuthenticated ? (
                  <>
                    <IconButton
                      color="inherit"
                      onClick={() => navigate('/favorites')}
                      sx={{ color: 'white' }}
                    >
                      <Favorite />
                    </IconButton>
                    
                    <IconButton
                      color="inherit"
                      onClick={() => navigate('/notifications')}
                      sx={{ color: 'white' }}
                    >
                      <Notifications />
                    </IconButton>

                    <IconButton
                      onClick={handleProfileMenuOpen}
                      sx={{ color: 'white' }}
                    >
                      {user?.avatar ? (
                        <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
                      ) : (
                        <AccountCircle />
                      )}
                    </IconButton>
                  </>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      component={RouterLink}
                      to="/login"
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255,255,255,0.1)',
                        }
                      }}
                      variant="outlined"
                      size="small"
                    >
                      Войти
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      sx={{
                        background: '#007AFF',
                        color: 'white',
                        '&:hover': {
                          background: '#0056CC',
                        }
                      }}
                      variant="contained"
                      size="small"
                    >
                      Регистрация
                    </Button>
                  </Box>
                )}

                {isMobile && (
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ color: 'white', ml: 1 }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
              </Box>
            </Toolbar>
          </Container>
        </StyledAppBar>
      </Slide>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            background: '#000',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            mt: 1,
          }
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
          Профиль
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
          Настройки
        </MenuItem>
        {user?.role === 'admin' && (
          <MenuItem onClick={() => { navigate('/erp'); handleProfileMenuClose(); }}>
            ERP система
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>
          Выйти
        </MenuItem>
      </Menu>

      {/* Toolbar spacer */}
      <Toolbar />
    </>
  );
};

export default Header; 