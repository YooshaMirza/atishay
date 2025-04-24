import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ArticleProvider } from './contexts/ArticleContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Survey from './components/auth/Survey';
import ArticleDetail from './components/articles/ArticleDetail';
import Profile from './pages/Profile';
import Saved from './pages/Saved';
import AdminDashboard from './components/admin/AdminDashboard';
import SubmitArticle from './pages/SubmitArticle';

// Protected route component for authenticated-only features
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <SignIn />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser || !userData?.isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Survey redirect component
const SurveyRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userData, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (userData && !userData.surveyCompleted) {
    return <Survey />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ArticleProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            
            <main className="flex-grow">
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route
                  path="/survey"
                  element={
                    <ProtectedRoute>
                      <Survey />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Home />} />
                <Route path="/article/:id" element={<ArticleDetail />} />
                <Route path="/submit-article" element={<SubmitArticle />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/saved"
                  element={
                    <ProtectedRoute>
                      <SurveyRedirect>
                        <Saved />
                      </SurveyRedirect>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </ArticleProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;