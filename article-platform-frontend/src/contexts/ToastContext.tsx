    // File: src/contexts/ToastContext.tsx
    import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react';
    import { v4 as uuidv4 } from 'uuid'; // For generating unique toast IDs

    export type ToastVariant = 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

    export interface ToastMessage {
      id: string;
      message: string;
      variant: ToastVariant;
      duration?: number; // Optional duration in ms for auto-dismiss
    }

    interface ToastContextType {
      toasts: ToastMessage[];
      addToast: (message: string, variant: ToastVariant, duration?: number) => void;
      removeToast: (id: string) => void;
    }

    const ToastContext = createContext<ToastContextType | undefined>(undefined);

    export const useToasts = (): ToastContextType => {
      const context = useContext(ToastContext);
      if (!context) {
        throw new Error('useToasts must be used within a ToastProvider');
      }
      return context;
    };

    interface ToastProviderProps {
      children: ReactNode;
    }

    export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
      const [toasts, setToasts] = useState<ToastMessage[]>([]);

      const addToast = useCallback((message: string, variant: ToastVariant, duration: number = 5000) => {
        const id = uuidv4();
        setToasts(prevToasts => [...prevToasts, { id, message, variant, duration }]);

        // Auto-dismiss if duration is provided
        if (duration) {
          setTimeout(() => {
            removeToast(id);
          }, duration);
        }
      }, []);

      const removeToast = useCallback((id: string) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
      }, []);

      return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
          {children}
        </ToastContext.Provider>
      );
    };
    