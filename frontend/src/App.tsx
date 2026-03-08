import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './app/auth';
import { Dashboard, ExportPage, ListPage, TreePage } from './app/data-pages';
import { MapPage, ReportsPage, StatsPage, TimelinePage } from './app/analytics-pages';
import { GalleryPage, LoginPage } from './app/auxiliary-pages';
import { CreatePersonFormPage, EditPersonFormPage } from './app/person-form-pages';
import { PersonProfilePage } from './app/person-profile-page';
import { ToastContainer } from './components/Toast';
import { PageLoader } from './components/PageState';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <PageLoader fullHeight message="Initialisation de l'application..." />;
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/tree" element={<TreePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/person/new" element={<CreatePersonFormPage />} />
        <Route path="/person/:id/edit" element={<EditPersonFormPage />} />
        <Route path="/person/:id" element={<PersonProfilePage />} />
        <Route path="/person/:id/gallery" element={<GalleryPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
