    // File: src/components/NavigationBar.tsx
    // Purpose: Navigation bar component for the application, with improved alignment.

    import React from 'react';
    import Container from 'react-bootstrap/Container';
    import Navbar from 'react-bootstrap/Navbar';
    import Nav from 'react-bootstrap/Nav';
    import NavDropdown from 'react-bootstrap/NavDropdown';
    import { useLocation, useNavigate } from 'react-router-dom';
    import { Book, PersonCircle, PersonGear } from 'react-bootstrap-icons';
    import { useAuth } from '../contexts/AuthContext';
    import './NavigationBar.css'; // Ensure this CSS file is imported

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

      const UserIcon = user?.role === 'admin' ? PersonGear : PersonCircle;

      const iconDropdownToggle = (
        <span className="user-icon-circle">
          <UserIcon size={20} />
        </span>
      );

      // Content for the dropdown menu items (reused for both dropdown versions)
      const dropdownItems = (
        <>
          <NavDropdown.Header className="custom-nav-dropdown-header" style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#34d399' }}>
            Hello, {user?.firstName || user?.email?.split('@')[0]}
          </NavDropdown.Header>
          <NavDropdown.Divider />
          <NavDropdown.Item onClick={() => handleNavClick('/profile')} className="custom-nav-dropdown-item">
            My Profile
          </NavDropdown.Item>
          {user?.role === 'admin' && (
            <NavDropdown.Item
              onClick={() => handleNavClick('/admin')}
              className="custom-nav-dropdown-item"
            >
              Manage Articles
            </NavDropdown.Item>
          )}
          <NavDropdown.Divider />
          <NavDropdown.Item
            onClick={handleLogout}
            className="custom-nav-dropdown-item"
          >
            Logout
          </NavDropdown.Item>
        </>
      );

      return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm py-3">
          <Container fluid>
            <Navbar.Brand
              onClick={() => handleNavClick('/')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="Go to homepage"
              className="custom-nav-brand"
            >
              <Book size={20} className="me-2" />
              <span className="fw-bold">Articulate</span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              {/* align-items-center on the Nav component helps align its direct children vertically */}
              <Nav className="ms-auto align-items-center">
                <Nav.Link
                  onClick={() => handleNavClick('/')}
                  active={location.pathname === '/'}
                  className="custom-nav-link px-3" // px-3 for horizontal padding
                >
                  Home
                </Nav.Link>

                {isLoading ? (
                  <Nav.Link disabled className="custom-nav-link px-3">Loading...</Nav.Link>
                ) : isAuthenticated && user ? (
                  <>
                                  <Nav.Link
                  onClick={() => handleNavClick('/articles')}
                  active={location.pathname.startsWith('/articles')}
                  className="custom-nav-link px-3" // px-3 for horizontal padding
                >
                  Articles
                </Nav.Link>
                    {/* Dropdown for larger screens (icon toggle) */}
                    <NavDropdown
                      title={iconDropdownToggle}
                      id="user-profile-dropdown-icon"
                      align="end"
                      className="custom-nav-link d-none d-lg-block user-dropdown-icon-toggle px-2" // Keep specific padding for icon version
                    >
                      {dropdownItems}
                    </NavDropdown>

                    {/* Dropdown for smaller screens (text toggle) */}
                    <NavDropdown
                      title={user.firstName || user.email.split('@')[0]}
                      id="user-profile-dropdown-text"
                      align="end"
                      className="custom-nav-link d-lg-none" // Removed px-3, will be handled by CSS on the toggle
                    >
                      {dropdownItems}
                    </NavDropdown>
                  </>
                ) : (
                  <Nav.Link
                    onClick={() => handleNavClick('/auth')}
                    active={location.pathname === '/auth'}
                    className="custom-nav-link px-3" // px-3 for horizontal padding
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
    