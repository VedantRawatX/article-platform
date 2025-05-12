    // File: src/components/auth/RegisterForm.tsx
    import React, { useState } from 'react';
    import { Card } from 'react-bootstrap';
    import Button from 'react-bootstrap/Button';
    import Form from 'react-bootstrap/Form';
    import Alert from 'react-bootstrap/Alert';
    import Row from 'react-bootstrap/Row';
    import Col from 'react-bootstrap/Col';
    import { useNavigate } from 'react-router-dom'; // Link removed
    import { useAuth } from '../../contexts/AuthContext'; // Adjust path
    import { registerUser, type RegisterUserDto as ApiRegisterUserDto } from '../../services/ApiService'; // Adjust path

    const RegisterForm: React.FC = () => {
      const [firstName, setFirstName] = useState('');
      const [lastName, setLastName] = useState('');
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [error, setError] = useState<string | null>(null);
      const [loading, setLoading] = useState<boolean>(false);

      const navigate = useNavigate();
      const auth = useAuth();

      const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!firstName || !lastName) {
          setError("First name and last name are required.");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        setLoading(true);

        const userData: ApiRegisterUserDto = {
          email,
          password,
          firstName,
          lastName,
        };

        try {
          const response = await registerUser(userData);
          auth.login(response.accessToken, response.user);
          navigate('/');
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message || 'Registration failed. Please try again.');
          } else {
            setError('An unexpected error occurred during registration.');
          }
          console.error("Registration form error:", err);
        } finally {
          setLoading(false);
        }
      };

      return (
        <>
          <Card.Title as="h2" className="text-center mb-4 fw-bold">Create Account</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit} autoComplete="off"> {/* Added autoComplete="off" */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="registerFormFirstNameInput"> {/* Unique controlId */}
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="registerFirstName" // Unique name
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="given-name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="registerFormLastNameInput"> {/* Unique controlId */}
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="registerLastName" // Unique name
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="family-name"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3" controlId="registerFormEmailInput"> {/* Unique controlId */}
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="registerEmail" // Unique name
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerFormPasswordInput"> {/* Unique controlId */}
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="registerPassword" // Unique name
                placeholder="Password (min. 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password" // Hint for new password
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerFormConfirmPasswordInput"> {/* Unique controlId */}
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="registerConfirmPassword" // Unique name
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </Form.Group>
            <div className="d-grid mt-4">
              <Button variant="primary" type="submit" size="lg" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register'}
              </Button>
            </div>
          </Form>
        </>
      );
    };
    export default RegisterForm;
    