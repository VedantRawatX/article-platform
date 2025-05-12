    // File: src/components/ProtectedRoute.tsx
    import React, { type ReactNode } from 'react';
    import { Navigate, useLocation } from 'react-router-dom';
    import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
    import Container from 'react-bootstrap/Container';
    import Spinner from 'react-bootstrap/Spinner';
    // import { Link } from 'react-router-dom'; // For "Access Denied" link example

    interface ProtectedRouteProps {
      children: ReactNode;
      allowedRoles?: string[];
    }

    const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
      const { isAuthenticated, user, isLoading } = useAuth();
      const location = useLocation();

      if (isLoading) {
        return (
          <Container className="text-center py-5 d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 112px)'}}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Verifying authentication...</span>
            </Spinner>
            <p className="ms-3 mb-0">Verifying authentication...</p>
          </Container>
        );
      }

      if (!isAuthenticated) {
        // User not authenticated, redirect to /auth page, login tab by default
        return <Navigate to="/auth" state={{ from: location }} replace />;
      }

      if (allowedRoles && allowedRoles.length > 0 && user) {
        const hasRequiredRole = allowedRoles.includes(user.role);
        if (!hasRequiredRole) {
          console.warn(`User with role '${user.role}' tried to access a route requiring roles: ${allowedRoles.join(', ')}`);
          // Redirect to homepage or a dedicated "Access Denied" page
          return <Navigate to="/" replace />;
          // Example for an inline "Access Denied" message:
          // return (
          //   <Container className="text-center py-5">
          //     <h2>Access Denied</h2>
          //     <p>You do not have the required permissions to view this page.</p>
          //     <Link to="/">Go to Homepage</Link>
          //   </Container>
          // );
        }
      }

      return <>{children}</>;
    };

    export default ProtectedRoute;
    