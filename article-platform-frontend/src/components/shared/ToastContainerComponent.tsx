    // File: src/components/shared/ToastContainerComponent.tsx
    import React from 'react';
    import Toast from 'react-bootstrap/Toast';
    import ToastContainer from 'react-bootstrap/ToastContainer'; // Bootstrap's container for positioning
    import { useToasts } from '../../contexts/ToastContext'; // Adjust path as needed

    const ToastContainerComponent: React.FC = () => {
      const { toasts, removeToast } = useToasts();

      if (!toasts.length) {
        return null;
      }

      return (
        <ToastContainer
          className="p-3"
          position="top-center" // Position top-center
          style={{ zIndex: 1060 }} // Ensure it's above most elements, adjust if needed
        >
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              bg={toast.variant.toLowerCase() as any} // `bg` prop expects string literals
              onClose={() => removeToast(toast.id)}
              // delay={toast.duration || 5000} // Handled by context for now
              // autohide // Handled by context for now
              className={toast.variant === 'light' ? 'text-dark' : 'text-white'} // Adjust text color for light/dark bg
            >
              <Toast.Header closeButton={true} className={toast.variant === 'light' ? 'bg-light text-dark' : `bg-${toast.variant} text-white`}>
                <strong className="me-auto">
                  {toast.variant.charAt(0).toUpperCase() + toast.variant.slice(1)} Notification
                </strong>
                {/* <small>just now</small> // Optional timestamp */}
              </Toast.Header>
              <Toast.Body>{toast.message}</Toast.Body>
            </Toast>
          ))}
        </ToastContainer>
      );
    };

    export default ToastContainerComponent;
    