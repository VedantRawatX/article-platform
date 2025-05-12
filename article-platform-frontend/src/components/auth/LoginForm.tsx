    // File: src/components/auth/LoginForm.tsx
    import React, { useState } from 'react';
    import { Card } from 'react-bootstrap'
    import Button from 'react-bootstrap/Button';
    import Form from 'react-bootstrap/Form';
    import Alert from 'react-bootstrap/Alert';
    import { useNavigate, useLocation } from 'react-router-dom'; // Link removed
    import { useAuth } from '../../contexts/AuthContext'; // Adjust path
    import { loginUser as apiLoginUser } from '../../services/ApiService'; // Adjust path

    const LoginForm: React.FC = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [loginError, setLoginError] = useState<string | null>(null);
      const [loginLoading, setLoginLoading] = useState<boolean>(false);

      const navigate = useNavigate();
      const location = useLocation();
      const auth = useAuth();

      const from = location.state?.from?.pathname || "/";

      const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoginError(null);
        setLoginLoading(true);

        if (!email || !password) {
          setLoginError('Email and password are required.');
          setLoginLoading(false);
          return;
        }

        try {
          const loginResponse = await apiLoginUser({ email, password });
          auth.login(loginResponse.accessToken, loginResponse.user);
          navigate(from, { replace: true });
        } catch (err) {
          if (err instanceof Error) {
            setLoginError(err.message || 'Login failed. Please check your credentials.');
          } else {
            setLoginError('An unexpected error occurred.');
          }
          console.error("Login form error:", err);
        } finally {
          setLoginLoading(false);
        }
      };

      return (
        <>
          <Card.Title as="h2" className="text-center mb-4 fw-bold">Login</Card.Title>
          {loginError && <Alert variant="danger">{loginError}</Alert>}
          <Form onSubmit={handleSubmit} autoComplete="off"> {/* Added autoComplete="off" as a hint */}
            <Form.Group className="mb-3" controlId="loginFormEmailInput"> {/* Unique controlId */}
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="loginEmail" // Unique name attribute
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loginLoading}
                autoComplete="username" // Standard autocomplete hint
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="loginFormPasswordInput"> {/* Unique controlId */}
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="loginPassword" // Unique name attribute
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loginLoading}
                autoComplete="current-password" // Standard autocomplete hint
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" size="lg" disabled={loginLoading}>
                {loginLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </Form>
        </>
      );
    };

    export default LoginForm;
    