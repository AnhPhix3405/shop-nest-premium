// src/config/redis.config.ts
// import { registerAs } from '@nestjs/config';

// export default registerAs('redis', () => ({
//   host: process.env.REDIS_HOST || 'localhost',
//   port: parseInt(process.env.REDIS_PORT || '6379', 10),
//   password: process.env.REDIS_PASSWORD || undefined,
//   db: parseInt(process.env.REDIS_DB || '0', 10),
// }));

import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  // Redis Cloud Configuration (theo format chuẩn Redis Cloud)
  username: process.env.REDIS_CLOUD_USERNAME || 'default',
  password: process.env.REDIS_CLOUD_PASSWORD, // Required
  socket: {
    host: process.env.REDIS_CLOUD_HOST, // VD: redis-13368.crce178.ap-east-1-1.ec2.redns.redis-cloud.com
    port: parseInt(process.env.REDIS_CLOUD_PORT || '13368', 10),
    connectTimeout: 30000,
    keepAlive: 30000,
    reconnectStrategy: (retries: number) => Math.min(retries * 50, 500),
  },
  
  // Redis Cloud connection options
  db: parseInt(process.env.REDIS_CLOUD_DB || '0', 10),
  
  // Connection settings for cloud
  connectTimeout: 30000,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  
  // TLS/SSL support (nếu Redis Cloud yêu cầu SSL)
  tls: process.env.REDIS_CLOUD_TLS === 'true' ? {
    rejectUnauthorized: false,
  } : undefined,
}));
