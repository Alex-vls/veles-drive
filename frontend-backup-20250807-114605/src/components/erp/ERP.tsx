import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as SalesIcon,
  Build as ServicesIcon,
  AccountBalance as FinancialIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Импортируем компоненты
import Dashboard from './Dashboard';
import Inventory from './Inventory';
import Sales from './Sales';
import Services from './Services';
import Financial from './Financial';
import Reports from './Reports';
import Settings from './Settings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`erp-tabpanel-${index}`}
      aria-labelledby={`erp-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ERP: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { label: 'Дашборд', icon: <DashboardIcon />, component: <Dashboard /> },
    { label: 'Инвентарь', icon: <InventoryIcon />, component: <Inventory /> },
    { label: 'Продажи', icon: <SalesIcon />, component: <Sales /> },
    { label: 'Услуги', icon: <ServicesIcon />, component: <Services /> },
    { label: 'Финансы', icon: <FinancialIcon />, component: <Financial /> },
    { label: 'Отчеты', icon: <ReportsIcon />, component: <Reports /> },
    { label: 'Настройки', icon: <SettingsIcon />, component: <Settings /> }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ minHeight: 64, textTransform: 'none' }}
            />
          ))}
        </Tabs>
      </Box>

      {tabs.map((tab, index) => (
        <TabPanel key={index} value={activeTab} index={index}>
          {tab.component}
        </TabPanel>
      ))}
    </Box>
  );
};

export default ERP; 