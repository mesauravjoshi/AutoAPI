import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from '#config/db.js';
import { createServer } from 'http';
// import { Server } from 'socket.io';
import { initializeSocket } from './config/socket.js';

dotenv.config();

const httpServer = createServer(app);

initializeSocket(httpServer);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    connectDB().catch(err => console.log(err));

    const runningServer = httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at: http://localhost:${PORT}`);
    });

    runningServer.on('error', (err) => {
      console.error('Server error:', err);
    });
  } catch (err) {
    console.error('Startup error:', err);
  }
}

start();