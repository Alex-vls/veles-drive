import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PrivateRoute from '@/components/PrivateRoute';

// Lazy load components
const Home = lazy(() => import('@/pages/Home'));
const Cars = lazy(() => import('@/pages/Cars'));
const CarDetails = lazy(() => import('@/pages/CarDetails'));
const Companies = lazy(() => import('@/pages/Companies'));
const CompanyDetails = lazy(() => import('@/pages/CompanyDetails'));
const Profile = lazy(() => import('@/pages/Profile'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));

const AppRoutes: React.FC = () => {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<LoadingSpinner size="large" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/:id" element={<CarDetails />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetails />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
};

export default AppRoutes; 