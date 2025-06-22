import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  DirectionsCar,
  Business,
  Article,
  Notifications as NotificationsIcon,
  Person,
  Login,
  Logout,
} from '@mui/icons-material';
import { useAuth } from './contexts/AuthContext';
import { useNotifications } from './contexts/NotificationContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
  };

  const menuItems = [
    { text: 'Автомобили', icon: <DirectionsCar />, path: '/cars' },
    { text: 'Компании', icon: <Business />, path: '/companies' },
    { text: 'Новости', icon: <Article />, path: '/news' },
  ];

  const userMenuItems = [
    { text: 'Профиль', path: '/profile' },
    { text: 'Выйти', action: handleLogout },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2, display: { sm: 'none' } }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}
            >
              VELES AUTO
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              {user ? (
                <>
                  <IconButton
                    size="large"
                    color="inherit"
                    onClick={() => navigate('/notifications')}
                  >
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>

                  <Tooltip title="Открыть меню">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar alt={user.username} src="/static/images/avatar/2.jpg" />
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
                  >
                    {userMenuItems.map((item) => (
                      <MenuItem
                        key={item.text}
                        onClick={item.action || (() => navigate(item.path))}
                      >
                        <Typography textAlign="center">{item.text}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : (
                <Button
                  color="inherit"
                  startIcon={<Login />}
                  onClick={() => navigate('/login')}
                >
                  Войти
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
          {user ? (
            <List>
              <ListItem button onClick={() => {
                navigate('/profile');
                setDrawerOpen(false);
              }}>
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Профиль" />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon><Logout /></ListItemIcon>
                <ListItemText primary="Выйти" />
              </ListItem>
            </List>
          ) : (
            <List>
              <ListItem button onClick={() => {
                navigate('/login');
                setDrawerOpen(false);
              }}>
                <ListItemIcon><Login /></ListItemIcon>
                <ListItemText primary="Войти" />
              </ListItem>
            </List>
          )}
        </Box>
      </Drawer>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} VELES AUTO. Все права защищены.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 