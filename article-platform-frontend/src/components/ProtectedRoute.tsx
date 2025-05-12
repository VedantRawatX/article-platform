    // File: src/components/ProtectedRoute.tsx
    import React from 'react';
    import type { ReactNode } from 'react';
    import { Navigate, useLocation } from 'react-router-dom';
    import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
    import Container from 'react-bootstrap/Container';
    import Spinner from 'react-bootstrap/Spinner';

    interface ProtectedRouteProps {
      children: ReactNode;
      allowedRoles?: string[]; // Optional: For role-based access control
    }

    const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
      const { isAuthenticated, user, isLoading } = useAuth();
      const location = useLocation();

      if (isLoading) {
        // Show a loading spinner while auth state is being determined
        return (
          <Container className="text-center py-5 d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 112px)'}}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading authentication status...</span>
            </Spinner>
            <p className="ms-3 mb-0">Verifying authentication...</p>
          </Container>
        );
      }

      if (!isAuthenticated) {
        // User not authenticated, redirect to login page
        // Pass the current location to redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
      }

      // Optional: Role-based access control
      if (allowedRoles && allowedRoles.length > 0 && user) {
        const hasRequiredRole = allowedRoles.includes(user.role);
        if (!hasRequiredRole) {
          // User does not have the required role, redirect to a 'forbidden' page or homepage
          // For simplicity, redirecting to homepage. You might want a dedicated /forbidden page.
          // You could also show an inline "Access Denied" message.
          console.warn(`User with role '${user.role}' tried to access a route requiring roles: ${allowedRoles.join(', ')}`);
          return <Navigate to="/" replace />;
          // Or:
          // return (
          //   <Container className="text-center py-5">
          //     <h2>Access Denied</h2>
          //     <p>You do not have the required permissions to view this page.</p>
          //     <Link to="/">Go to Homepage</Link>
          //   </Container>
          // );
        }
      }

      // User is authenticated (and has the required role if specified), render the children
      return <>{children}</>;
    };

    export default ProtectedRoute;
    