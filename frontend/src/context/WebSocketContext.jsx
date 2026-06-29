import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [lastNotification, setLastNotification] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem('token');

    // Create new STOMP client
    const client = new Client({
      webSocketFactory: () => {
        const wsUrl = import.meta.env.VITE_WS_URL || '';
        return new SockJS(`${wsUrl}/api/ws`);
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        // console.log(str); // Uncomment for debugging
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to WebSocket!');

      // Subscribe to user-specific queue
      client.subscribe('/user/queue/notifications', (message) => {
        if (message.body) {
          const notification = JSON.parse(message.body);
          setLastNotification(notification);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [user]);

  // Provide a method to explicitly clear the last notification if needed by consumers
  const clearLastNotification = () => setLastNotification(null);

  return (
    <WebSocketContext.Provider value={{ lastNotification, clearLastNotification }}>
      {children}
    </WebSocketContext.Provider>
  );
};
