import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from '#config/db.js';

dotenv.config();

// Connect DB + Start Server
connectDB().catch(err => console.log(err));

// Start server

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running at: http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
    });
  } catch (err) {
    console.error('Startup error:', err);
  }
}

start();