import { createTheme } from '@mui/material/styles';

// Apple-style color palette
const appleColors = {
  // Main colors
  white: '#FFFFFF',
  black: '#1D1D1F',
  
  // Grays
  gray50: '#F5F5F7',
  gray100: '#E5E5EA',
  gray200: '#D1D1D6',
  gray300: '#C7C7CC',
  gray400: '#AEAEB2',
  gray500: '#8E8E93',
  gray600: '#636366',
  gray700: '#48484A',
  gray800: '#3A3A3C',
  gray900: '#2C2C2E',
  
  // Accent colors
  blue: '#0071E3',
  blueLight: '#007AFF',
  green: '#34C759',
  greenLight: '#30D158',
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  purple: '#AF52DE',
  
  // Shadows
  shadowLight: '0 2px 8px rgba(60,60,67,0.03)',
  shadowMedium: '0 4px 16px rgba(60,60,67,0.08)',
  shadowHeavy: '0 8px 32px rgba(60,60,67,0.12)',
  
  // Gradients
  gradientBlue: 'linear-gradient(135deg, #0071E3 0%, #007AFF 100%)',
  gradientGreen: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: appleColors.blue,
      light: appleColors.blueLight,
      dark: '#0051A3',
      contrastText: appleColors.white,
    },
    secondary: {
      main: appleColors.green,
      light: appleColors.greenLight,
      dark: '#28A745',
      contrastText: appleColors.white,
    },
    error: {
      main: appleColors.red,
      light: '#FF6B6B',
      dark: '#CC2E2E',
    },
    warning: {
      main: appleColors.orange,
      light: '#FFB74D',
      dark: '#E65100',
    },
    info: {
      main: appleColors.blue,
      light: appleColors.blueLight,
      dark: '#0051A3',
    },
    success: {
      main: appleColors.green,
      light: appleColors.greenLight,
      dark: '#28A745',
    },
    background: {
      default: appleColors.white,
      paper: appleColors.white,
    },
    text: {
      primary: appleColors.black,
      secondary: appleColors.gray600,
      disabled: appleColors.gray400,
    },
    divider: appleColors.gray100,
    grey: {
      50: appleColors.gray50,
      100: appleColors.gray100,
      200: appleColors.gray200,
      300: appleColors.gray300,
      400: appleColors.gray400,
      500: appleColors.gray500,
      600: appleColors.gray600,
      700: appleColors.gray700,
      800: appleColors.gray800,
      900: appleColors.gray900,
    },
  },
  typography: {
    fontFamily: [
      'SF Pro Display',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontSize: '1rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    appleColors.shadowLight,
    appleColors.shadowMedium,
    appleColors.shadowHeavy,
    ...Array(20).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          padding: '12px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: appleColors.shadowMedium,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: appleColors.gradientBlue,
            '&:hover': {
              background: appleColors.blue,
            },
          },
          '&.MuiButton-containedSecondary': {
            background: appleColors.gradientGreen,
            '&:hover': {
              background: appleColors.green,
            },
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1.125rem',
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: appleColors.shadowLight,
          border: `1px solid ${appleColors.gray100}`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: appleColors.shadowMedium,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: appleColors.gray200,
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: appleColors.gray300,
            },
            '&.Mui-focused fieldset': {
              borderColor: appleColors.blue,
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${appleColors.gray100}`,
          boxShadow: appleColors.shadowLight,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: appleColors.gray50,
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
});

// Add custom CSS variables
const style = document.createElement('style');
style.textContent = `
  :root {
    --main-bg: ${appleColors.white};
    --main-text: ${appleColors.black};
    --gray-bg: ${appleColors.gray50};
    --divider: ${appleColors.gray100};
    --accent-blue: ${appleColors.blue};
    --accent-green: ${appleColors.green};
    --shadow: ${appleColors.shadowLight};
    --font-main: 'SF Pro Display', 'Inter', 'Helvetica Neue', Arial, sans-serif;
    
    --gradient-blue: ${appleColors.gradientBlue};
    --gradient-green: ${appleColors.gradientGreen};
    
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
  }
`;
document.head.appendChild(style);

export default theme; 