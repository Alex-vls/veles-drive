import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Profile from '../pages/profile/Profile';
import CompanyList from '../pages/companies/CompanyList';
import CompanyDetail from '../pages/companies/CompanyDetail';
import CompanyForm from '../pages/companies/CompanyForm';
import CarList from '../pages/cars/CarList';
import CarDetail from '../pages/cars/CarDetail';
import CarForm from '../pages/cars/CarForm';
import VehicleList from '../pages/vehicles/VehicleList';
import VehicleDetail from '../pages/vehicles/VehicleDetail';
import VehicleForm from '../pages/vehicles/VehicleForm';
import ErpDashboard from '../pages/erp/ErpDashboard';
import ProjectBoard from '../pages/erp/ProjectBoard';
import TaskDetail from '../pages/erp/TaskDetail';
import AuctionList from '../pages/auctions/AuctionList';
import AuctionDetail from '../pages/auctions/AuctionDetail';
import LeasingList from '../pages/leasing/LeasingList';
import LeasingDetail from '../pages/leasing/LeasingDetail';
import InsuranceList from '../pages/insurance/InsuranceList';
import InsuranceDetail from '../pages/insurance/InsuranceDetail';
import TelegramApp from '../pages/TelegramApp';
import NotFound from '../pages/NotFound';

// Protected Route Component
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Register />
          }
        />
      </Route>

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        
        {/* Profile Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Company Routes */}
        <Route path="/companies" element={<CompanyList />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route
          path="/companies/new"
          element={
            <ProtectedRoute>
              <CompanyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies/:id/edit"
          element={
            <ProtectedRoute>
              <CompanyForm />
            </ProtectedRoute>
          }
        />

        {/* Vehicle Routes (новые) */}
        <Route path="/vehicles" element={<VehicleList />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />
        <Route
          path="/vehicles/new"
          element={
            <ProtectedRoute>
              <VehicleForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles/:id/edit"
          element={
            <ProtectedRoute>
              <VehicleForm />
            </ProtectedRoute>
          }
        />

        {/* Car Routes (legacy) */}
        <Route path="/cars" element={<CarList />} />
        <Route path="/cars/:id" element={<CarDetail />} />
        <Route
          path="/cars/new"
          element={
            <ProtectedRoute>
              <CarForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars/:id/edit"
          element={
            <ProtectedRoute>
              <CarForm />
            </ProtectedRoute>
          }
        />

        {/* ERP Routes */}
        <Route
          path="/erp"
          element={
            <ProtectedRoute>
              <ErpDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/projects"
          element={
            <ProtectedRoute>
              <ProjectBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/tasks/:id"
          element={
            <ProtectedRoute>
              <TaskDetail />
            </ProtectedRoute>
          }
        />

        {/* Auction Routes */}
        <Route path="/auctions" element={<AuctionList />} />
        <Route path="/auctions/:id" element={<AuctionDetail />} />

        {/* Leasing Routes */}
        <Route path="/leasing" element={<LeasingList />} />
        <Route path="/leasing/:id" element={<LeasingDetail />} />

        {/* Insurance Routes */}
        <Route path="/insurance" element={<InsuranceList />} />
        <Route path="/insurance/:id" element={<InsuranceDetail />} />

        {/* Telegram Mini App Routes */}
        <Route path="/telegram-app/:sessionId" element={<TelegramApp />} />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 