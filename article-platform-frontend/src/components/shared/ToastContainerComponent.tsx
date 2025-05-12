    // File: src/components/shared/ToastContainerComponent.tsx
    import React from 'react';
    import Toast from 'react-bootstrap/Toast';
    import ToastContainer from 'react-bootstrap/ToastContainer';
    import { useToasts } from '../../contexts/ToastContext'; // Adjust path as needed
    import './ToastContainerComponent.css'; // Import custom CSS for positioning

    // Estimate or get navbar height (this might need to be dynamic or a CSS variable if navbar height changes)
    const NAVBAR_HEIGHT = '70px'; // Adjust this value based on your actual Navbar height + desired gap

    const ToastContainerComponent: React.FC = () => {
      const { toasts, removeToast } = useToasts();

      if (!toasts.length) {
        return null;
      }

      return (
        <ToastContainer
          // className="p-3" // Default padding, can be adjusted
          position="top-center"
          // Custom style to position it below the navbar
          // The 'toast-container-sticky-below-nav' class will handle this
          className="toast-container-sticky-below-nav"
        >
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              bg={toast.variant.toLowerCase() as any}
              onClose={() => removeToast(toast.id)}
              // Autohide is handled by the context's setTimeout
              // delay={toast.duration || 5000}
              // autohide
              className={`mb-2 ${toast.variant === 'light' ? 'text-dark' : 'text-white'}`} // Added mb-2 for spacing between stacked toasts
            >
              <Toast.Header
                closeButton={true}
                className={toast.variant === 'light' ? 'bg-light text-dark' : `bg-${toast.variant} text-white`}
              >
                <strong className="me-auto">
                  {toast.variant.charAt(0).toUpperCase() + toast.variant.slice(1)}
                </strong>
                {/* <small>just now</small> */}
              </Toast.Header>
              <Toast.Body>{toast.message}</Toast.Body>
            </Toast>
          ))}
        </ToastContainer>
      );
    };

    export default ToastContainerComponent;
    