    // File: src/pages/UserProfilePage.tsx
    import React, { useState, useEffect, type FormEvent } from 'react';
    import Container from 'react-bootstrap/Container';
    import Row from 'react-bootstrap/Row';
    import Col from 'react-bootstrap/Col';
    import Card from 'react-bootstrap/Card';
    import Form from 'react-bootstrap/Form';
    import Button from 'react-bootstrap/Button';
    import Alert from 'react-bootstrap/Alert';
    import Spinner from 'react-bootstrap/Spinner';
    import { useAuth } from '../contexts/AuthContext'; // Adjust path
    import { useToasts } from '../contexts/ToastContext'; // Adjust path
    import {
      updateUserProfile,
      changeUserPassword,
      type UpdateUserProfileDto,
      type ChangeUserPasswordDto,
      type ApiUser
    } from '../services/ApiService'; // Adjust path

    const UserProfilePage: React.FC = () => {
      const { user, token, login: updateAuthContextUser } = useAuth();
      const { addToast } = useToasts();

      // State for profile update form
      const [firstName, setFirstName] = useState(user?.firstName || '');
      const [lastName, setLastName] = useState(user?.lastName || '');
      const [email, setEmail] = useState(user?.email || '');
      const [profileLoading, setProfileLoading] = useState(false);
      const [profileError, setProfileError] = useState<string | null>(null);

      // State for password change form
      const [currentPassword, setCurrentPassword] = useState('');
      const [newPassword, setNewPassword] = useState('');
      const [confirmNewPassword, setConfirmNewPassword] = useState('');
      const [passwordLoading, setPasswordLoading] = useState(false);
      const [passwordError, setPasswordError] = useState<string | null>(null);

      useEffect(() => {
        if (user) {
          setFirstName(user.firstName || '');
          setLastName(user.lastName || '');
          setEmail(user.email || '');
        }
      }, [user]);

      const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!token || !user) {
          addToast("Authentication required.", 'warning');
          return;
        }
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setProfileError("First name, last name, and email cannot be empty.");
            addToast("First name, last name, and email cannot be empty.", 'danger');
            return;
        }
        setProfileLoading(true);
        setProfileError(null);
        const profileData: UpdateUserProfileDto = {};
        if (firstName !== user.firstName) profileData.firstName = firstName;
        if (lastName !== user.lastName) profileData.lastName = lastName;
        if (email !== user.email) profileData.email = email;

        if (Object.keys(profileData).length === 0) {
          addToast("No changes to save.", 'info');
          setProfileLoading(false);
          return;
        }
        try {
          const updatedUser = await updateUserProfile(profileData, token);
          updateAuthContextUser(token, updatedUser);
          addToast("Profile updated successfully!", 'success');
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to update profile.";
          setProfileError(msg);
          addToast(msg, 'danger');
        } finally {
          setProfileLoading(false);
        }
      };

      const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPasswordError(null); // Clear previous errors

        if (!token) {
          addToast("Authentication required.", 'warning');
          return;
        }

        // 1. Check if all password fields are filled
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            const msg = "All password fields are required.";
            setPasswordError(msg);
            addToast(msg, 'danger');
            return;
        }

        // 2. Check if new password and confirm password match
        if (newPassword !== confirmNewPassword) {
          const msg = "New passwords do not match.";
          setPasswordError(msg);
          addToast(msg, 'danger');
          return;
        }

        // 3. Check new password length (minimum 8 characters)
        if (newPassword.length < 8) {
            const msg = "New password must be at least 8 characters long.";
            setPasswordError(msg);
            addToast(msg, 'danger');
            return;
        }

        // If frontend checks pass, proceed to API call
        setPasswordLoading(true);
        const passwordData: ChangeUserPasswordDto = { currentPassword, newPassword };

        try {
          const response = await changeUserPassword(passwordData, token);
          addToast(response.message || "Password changed successfully!", 'success');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        } catch (err) {
          // Errors from the backend (like "Incorrect current password" or "New password cannot be same as old")
          // will be caught here.
          const msg = err instanceof Error ? err.message : "Failed to change password.";
          setPasswordError(msg);
          addToast(msg, 'danger');
        } finally {
          setPasswordLoading(false);
        }
      };

      if (!user) {
        return (<Container className="py-5 text-center"><Spinner animation="border" /><p>Loading user data...</p></Container>);
      }

      return (
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={10} lg={8} xl={7}>
              <h1 className="mb-4 display-5 fw-bold text-center">Manage Your Profile</h1>
              <Card className="mb-4 shadow-sm">
                <Card.Header as="h5" className="bg-light">Profile Details</Card.Header>
                <Card.Body className="p-4">
                  {profileError && <Alert variant="danger" onClose={() => setProfileError(null)} dismissible>{profileError}</Alert>}
                  <Form onSubmit={handleProfileUpdate}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="profileFirstName">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={profileLoading} required />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="profileLastName">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={profileLoading} required />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3" controlId="profileEmail">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={profileLoading} required />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={profileLoading} className="w-100">
                      {profileLoading ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Saving...</> : 'Save Profile Changes'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>

              <Card className="shadow-sm">
                <Card.Header as="h5" className="bg-light">Change Password</Card.Header>
                <Card.Body className="p-4">
                  {passwordError && <Alert variant="danger" onClose={() => setPasswordError(null)} dismissible>{passwordError}</Alert>}
                  <Form onSubmit={handleChangePassword}>
                    <Form.Group className="mb-3" controlId="currentPassword">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={passwordLoading} required autoComplete="current-password" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="newPassword">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control type="password" placeholder="Min. 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={passwordLoading} required autoComplete="new-password" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="confirmNewPassword">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} disabled={passwordLoading} required autoComplete="new-password" />
                    </Form.Group>
                    <Button variant="warning" type="submit" disabled={passwordLoading} className="w-100">
                      {passwordLoading ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Changing...</> : 'Change Password'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    };

    export default UserProfilePage;
    