    // File: src/pages/AuthPage.tsx
    import React from 'react';
    import Container from 'react-bootstrap/Container';
    import Row from 'react-bootstrap/Row';
    import Col from 'react-bootstrap/Col';
    import Card from 'react-bootstrap/Card';

    import LoginForm from '../components/auth/LoginForm'; // Adjust path as needed
    import RegisterForm from '../components/auth/RegisterForm'; // Adjust path as needed

    const AuthPage: React.FC = () => {
      return (
        <Container className="py-5 d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 140px)' }}>
          <Row className="w-100 justify-content-center">
            {/* Increased column width for a wider card */}
            <Col lg={12} xl={10} xxl={8}> {/* Example: lg={12} makes it full width on large, xl={10} slightly less, xxl={8} even less on very large screens */}
              <Card className="shadow-lg">
                <Row className="g-0">
                  <Col md={6} className="p-4 p-sm-5 border-end d-flex flex-column justify-content-center"> {/* Added flex for vertical centering if needed */}
                    <LoginForm />
                  </Col>
                  <Col md={6} className="p-4 p-sm-5 d-flex flex-column justify-content-center">
                    <RegisterForm />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    };

    export default AuthPage;
    