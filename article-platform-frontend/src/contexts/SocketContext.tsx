    // File: src/contexts/SocketContext.tsx
    import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
    import io, { Socket } from 'socket.io-client';
    import { useAuth } from './AuthContext'; // To potentially use auth token for socket connection

    interface SocketContextType {
      socket: Socket | null;
      isConnected: boolean;
    }

    const SocketContext = createContext<SocketContextType | undefined>(undefined);

    export const useSocket = (): SocketContextType => {
      const context = useContext(SocketContext);
      if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
      }
      return context;
    };

    interface SocketProviderProps {
      children: ReactNode;
    }

    // Get the backend URL from environment variables, defaulting if not set
    const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3000';
    // If you used a namespace on the backend (e.g., '/chat'), append it here:
    // const SOCKET_SERVER_URL = (import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3000') + '/chat';


    export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
      const [socket, setSocket] = useState<Socket | null>(null);
      const [isConnected, setIsConnected] = useState<boolean>(false);
      const { token, isAuthenticated } = useAuth(); // Get auth token and status

      useEffect(() => {
        if (isAuthenticated && token) { // Only connect if authenticated
          console.log('Attempting to connect to WebSocket server with token...');
          // If your backend ChatGateway expects a token for authentication:
          const newSocket = io(SOCKET_SERVER_URL, {
            // autoConnect: false, // You can manage connection manually if needed
            auth: {
              token: token, // Send token for socket authentication
            },
            // transports: ['websocket'], // Optional: force websocket transport
          });

          setSocket(newSocket);

          newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Socket connected:', newSocket.id);
            // Example: Client can join a default room upon connection
            // newSocket.emit('joinRoom', 'general-chat');
          });

          newSocket.on('disconnect', (reason) => {
            setIsConnected(false);
            console.log('Socket disconnected:', newSocket.id, 'Reason:', reason);
          });

          newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
            // Optionally, you could try to reconnect or show an error to the user
          });

          // Example: Listen for a connection status message from the server
          newSocket.on('connectionStatus', (data) => {
            console.log('Connection status from server:', data);
          });

          return () => {
            console.log('Cleaning up socket connection...');
            newSocket.off('connect');
            newSocket.off('disconnect');
            newSocket.off('connect_error');
            newSocket.off('connectionStatus');
            newSocket.close();
            setSocket(null);
            setIsConnected(false);
          };
        } else if (!isAuthenticated && socket) {
          // If user logs out, disconnect the socket
          console.log('User logged out, disconnecting socket...');
          socket.close();
          setSocket(null);
          setIsConnected(false);
        }
      }, [isAuthenticated, token]); // Re-run effect if authentication status or token changes

      return (
        <SocketContext.Provider value={{ socket, isConnected }}>
          {children}
        </SocketContext.Provider>
      );
    };
    