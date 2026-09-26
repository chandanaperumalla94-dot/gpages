import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import CategoriesPage from './pages/CategoriesPage';
import CategoryPlacesPage from './pages/CategoryPlacesPage';
import ExplorePage from './pages/ExplorePage';
import AboutPage from './pages/AboutPage';
import BusinessesPage from './pages/BusinessesPage';
import ComingSoon from './pages/ComingSoon';
import ProtectedRoute from './routes/ProtectedRoute';
import UserDashboard from './pages/UserDashboard';
import BusinessDashboard from './pages/business/BusinessDashboard';
import CreateListing from './pages/business/CreateListing';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminBusinesses from './pages/admin/AdminBusinesses';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import CityPage from './pages/CityPage';
import CategoryListingPage from './pages/CategoryListingPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import PublicBusinessProfilePage from './pages/PublicBusinessProfilePage';
import RestaurantEditor from './pages/business/RestaurantEditor';
import BusinessEditorPage from './pages/business/BusinessEditorPage';
import WhatsAppButton from './components/WhatsAppButton';

export default function App() {
  const location = useLocation();
  const isRestaurantProfile = /^\/business\/[^/]+$/.test(location.pathname);
  const isBusinessOwnerSurface = /^(\/business\/dashboard|\/business\/listings\/new(?:\/restaurant)?|\/business\/listings\/[^/]+\/edit)$/.test(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {!isRestaurantProfile && !isBusinessOwnerSurface && <Header />}
      <main className="flex-1 bg-[radial-gradient(circle_at_8%_8%,rgba(20,184,166,0.10),transparent_22rem),radial-gradient(circle_at_92%_35%,rgba(59,130,246,0.09),transparent_26rem)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/place/:id" element={<PlaceDetailPage />} />
          <Route path="/business/:businessId" element={<PublicBusinessProfilePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:category" element={<CategoryPlacesPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/businesses" element={<BusinessesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Business owner area */}
          <Route
            path="/business/dashboard"
            element={
              <ProtectedRoute roles={['business']}>
                <BusinessDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/listings/new"
            element={
              <ProtectedRoute roles={['business']}>
                <CreateListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/listings/new/restaurant"
            element={
              <ProtectedRoute roles={['business']}>
                <CreateListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/listings/:id/edit"
            element={
              <ProtectedRoute roles={['business', 'admin']}>
                <BusinessEditorPage />
              </ProtectedRoute>
            }
          />
          <Route path="/business/register" element={<Register />} />

          {/* Admin area */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="businesses" element={<AdminBusinesses />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          {/* SEO-friendly location routes, e.g.:
              /andhra-pradesh/east-godavari/rajahmundry
              /andhra-pradesh/east-godavari/rajahmundry/schools           */}
          <Route path="/:state/:district/:city/:category" element={<CategoryListingPage />} />
          <Route path="/:state/:district/:city" element={<CityPage />} />

          <Route path="*" element={<ComingSoon title="This page" />} />
        </Routes>
      </main>
      {!isRestaurantProfile && !isBusinessOwnerSurface && <Footer />}
      {!isRestaurantProfile && !isBusinessOwnerSurface && <WhatsAppButton />}
    </div>
  );
}
