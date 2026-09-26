require('dotenv').config();
const dns = require('dns');

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-secret-change-me';
  console.warn('[server] JWT_SECRET is not set. Falling back to a local development secret. Set it in your .env for production safety.');
}

const dnsServers = (process.env.DNS_SERVERS || '')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers.length > 0) {
  dns.setServers(dnsServers);
}

const app = require('./app');
const connectDB = require('./config/db');

const preferredPort = Number(process.env.PORT) || 5000;

const listenOnPort = (port) =>
  new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      resolve({ server, port });
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        reject({ code: 'EADDRINUSE', port });
        return;
      }
      reject(error);
    });
  });

const start = async () => {
  await connectDB();

  let port = preferredPort;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      const { server, port: activePort } = await listenOnPort(port);
      process.env.PORT = String(activePort);

      console.log(`[server] Google Pages API running on port ${activePort} (${process.env.NODE_ENV || 'development'})`);

      process.on('unhandledRejection', (err) => {
        console.error(`[server] Unhandled rejection: ${err.message}`);
        server.close(() => process.exit(1));
      });

      return;
    } catch (error) {
      if (error && error.code === 'EADDRINUSE') {
        const nextPort = error.port + 1;
        console.warn(`[server] Port ${error.port} is busy. Retrying on ${nextPort}...`);
        port = nextPort;
        continue;
      }

      throw error;
    }
  }

  throw new Error(`Unable to start the server after trying ports ${preferredPort} to ${port}.`);
};

start();
