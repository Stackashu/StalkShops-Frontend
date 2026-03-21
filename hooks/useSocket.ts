import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (userId?: string, vendorId?: string) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!userId && !vendorId) return;

        // Initialize socket
        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
            transports: ['websocket'],
            upgrade: false
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Connected to socket server:', socket.id);
            // Register user/vendor as online
            socket.emit('register', { userId, vendorId });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        return () => {
            socket.disconnect();
        };
    }, [userId, vendorId]);

    return socketRef.current;
};
