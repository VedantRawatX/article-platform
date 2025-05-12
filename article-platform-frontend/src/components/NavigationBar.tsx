    // File: src/components/NavigationBar.tsx
    // Purpose: Navigation bar component for the application, with logo and enhanced styling.

    import React from 'react';
    import Container from 'react-bootstrap/Container';
    import Navbar from 'react-bootstrap/Navbar';
    import Nav from 'react-bootstrap/Nav';
    import NavDropdown from 'react-bootstrap/NavDropdown';
    import { useLocation, useNavigate } from 'react-router-dom';
    import { Book } from 'react-bootstrap-icons';
    import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
    import './NavigationBar.css'; // Import custom CSS for hover effect

    const NavigationBar: React.FC = () => {
      const location = useLocation();
      const navigate = useNavigate();
      const { isAuthenticated, user, logout, isLoading } = useAuth();

      const handleNavClick = (path: string) => {
        navigate(path);
      };

      const handleLogout = () => {
        logout();
        navigate('/auth');
      };

      return (
        // Increased overall Navbar padding (e.g., py-3)
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm py-3">
          <Container fluid>
            <Navbar.Brand
              onClick={() => handleNavClick('/')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="Go to homepage"
              className="custom-nav-brand" // Added class for potential brand-specific hover
            >
              <Book size={28} className="me-2" /> {/* Slightly larger icon */}
              <span className="fw-bold">Article Platform</span> {/* Bolder brand text */}
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link
                  onClick={() => handleNavClick('/')}
                  active={location.pathname === '/'}
                  className="custom-nav-link px-3" // Added custom class and padding
                >
                  Home
                </Nav.Link>
                <Nav.Link
                  onClick={() => handleNavClick('/articles')}
                  active={location.pathname.startsWith('/articles')}
                  className="custom-nav-link px-3" // Added custom class and padding
                >
                  Articles
                </Nav.Link>

                {isLoading ? (
                  <Nav.Link disabled className="px-3">Loading...</Nav.Link>
                ) : isAuthenticated && user ? (
                  <NavDropdown
                    title={user.firstName || user.email}
                    id="user-profile-dropdown"
                    align="end"
                    className="custom-nav-link px-md-2" // Padding for dropdown toggle
                  >
                    {user.role === 'admin' && (
                      <NavDropdown.Item
                        onClick={() => handleNavClick('/admin')}
                        className="custom-nav-dropdown-item" // Custom class for dropdown items
                      >
                        Manage Articles
                      </NavDropdown.Item>
                    )}
                    {(user.role === 'admin') && <NavDropdown.Divider />}
                    <NavDropdown.Item
                      onClick={handleLogout}
                      className="custom-nav-dropdown-item" // Custom class for dropdown items
                    >
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                ) : (
                  <Nav.Link
                    onClick={() => handleNavClick('/auth')}
                    active={location.pathname === '/auth'}
                    className="custom-nav-link px-3" // Added custom class and padding
                  >
                    Sign-In / Sign-Up
                  </Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      );
    };

    export default NavigationBar;
    