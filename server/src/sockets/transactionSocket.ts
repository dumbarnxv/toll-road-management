import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';

export const initializeSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('join-dashboard', (boothId: string) => {
      socket.join(`booth-${boothId}`);
      socket.join('admin-dashboard');
      logger.info(`Client ${socket.id} joined booth-${boothId}`);
    });

    socket.on('transaction-created', (data) => {
      io.to('admin-dashboard').emit('transaction-update', data);
      logger.debug('Transaction update emitted:', data);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};
