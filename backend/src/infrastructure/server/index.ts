import dotenv from 'dotenv';
import { App } from './app';

dotenv.config();

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  const app = new App();
  
  try {
    await app.connect();
    
    app.app.listen(PORT, () => {
      console.log(`🚀 FuelEU Maritime API Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📍 Routes: http://localhost:${PORT}/api/routes`);
      console.log(`📍 Compliance: http://localhost:${PORT}/api/compliance`);
      console.log(`📍 Banking: http://localhost:${PORT}/api/banking`);
      console.log(`📍 Pools: http://localhost:${PORT}/api/pools`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      await app.disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully');
      await app.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
