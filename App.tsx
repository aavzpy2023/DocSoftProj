import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { User, ModalState } from './types';
import LoginView from './components/LoginView';
import DocuHubEditor from './components/DocuHubEditor';
import UserManagementView from './components/UserManagementView';
import Modal from './components/Modal'; // For login errors
import { logoutUser as apiLogoutUser, fetchCurrentUser } from './services/apiService';

// Helper for Protected Routes
interface ProtectedRouteProps {
  isAuthenticated: boolean;
  isAllowed?: boolean; // For role-based access
  redirectTo?: string;
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  isAllowed = true, // Default to allowed if no specific role check
  redirectTo = "/login",
  children,
}) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  if (!isAllowed) {
    // If authenticated but not allowed (e.g., wrong role), redirect to home or an 'unauthorized' page
    return <Navigate to="/" replace />; 
  }
  return children;
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true); // For checking initial auth
  const [authActionLoading, setAuthActionLoading] = useState<boolean>(false); // For login/logout API calls
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, title: '', message: '', isError: false });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check auth status on app load using token and backend call
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoadingAuth(true);
      const result = await fetchCurrentUser();
      if (result.success && result.user) {
        setCurrentUser(result.user);
      } else {
        // Token might be invalid or not present, ensure localStorage is clear if needed
        localStorage.removeItem('docuhubToken'); // ensure token is cleared if fetch fails
      }
      setIsLoadingAuth(false);
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = useCallback((user: User, token?: string /* token is now managed by apiService */) => {
    setCurrentUser(user);
    // localStorage token setting is now handled within apiService.loginUser success path
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  }, [navigate, location.state]);
  
  const setLoginError = useCallback((message: string) => {
    setModalState({ isOpen: true, title: 'Login Failed', message, isError: true });
  }, []);

  const handleLogout = useCallback(async () => {
    setAuthActionLoading(true);
    await apiLogoutUser(); // apiService now handles removing the token
    setCurrentUser(null);
    setAuthActionLoading(false);
    navigate('/login');
  }, [navigate]);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route 
          path="/login" 
          element={
            currentUser ? <Navigate to="/" /> : 
            <LoginView 
              onLoginSuccess={handleLoginSuccess} 
              setLoginError={setLoginError}
              isLoading={authActionLoading}
              setIsLoading={setAuthActionLoading}
            />
          } 
        />
        <Route 
          path="/"
          element={
            <ProtectedRoute isAuthenticated={!!currentUser}>
              <DocuHubEditor currentUser={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/users"
          element={
            <ProtectedRoute 
              isAuthenticated={!!currentUser} 
              isAllowed={currentUser?.role === 'admin'}
            >
              <UserManagementView currentUser={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        {/* Optional: Add a registration route if you plan to have a separate registration page */}
        {/* <Route path="/register" element={<RegisterView />} /> */}
        <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
      </Routes>
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        isError={modalState.isError}
      >
        <p>{modalState.message}</p>
      </Modal>
      {authActionLoading && !isLoadingAuth && ( // Show general loader for logout or login
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        </div>
      )}
    </>
  );
};

export default App;
