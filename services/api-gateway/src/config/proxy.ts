import {
  createProxyMiddleware,
  Options,
  RequestHandler,
} from 'http-proxy-middleware';
import { logger } from '../utils/logger';

interface ServiceConfig {
  target: string;
  pathRewrite?: { [key: string]: string };
}

// Service URLs from environment or defaults for development
const services: Record<string, ServiceConfig> = {
  auth: {
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:8081',
    pathRewrite: { '^/api/auth': '' },
  },
  block: {
    target: process.env.BLOCK_SERVICE_URL || 'http://localhost:8002',
    pathRewrite: { '^/api/blocks': '/block', '^/api/tables': '/table' },
  },
  blog: {
    target: process.env.BLOG_SERVICE_URL || 'http://localhost:8003',
    pathRewrite: { '^/api/blogs': '' },
  },
  notification: {
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8004',
    pathRewrite: { '^/api/notifications': '' },
  },
};

const createProxy = (serviceName: string, config: ServiceConfig): RequestHandler => {
  const options: Options = {
    target: config.target,
    changeOrigin: true,
    pathRewrite: config.pathRewrite,
    on: {
      proxyReq: (_proxyReq, req) => {
        logger.debug(
          {
            service: serviceName,
            method: req.method,
            path: req.url,
            target: config.target,
          },
          'Proxying request'
        );
      },
      proxyRes: (proxyRes, req) => {
        logger.debug(
          {
            service: serviceName,
            method: req.method,
            path: req.url,
            status: proxyRes.statusCode,
          },
          'Proxy response'
        );
      },
      error: (err, req, res) => {
        logger.error(
          {
            service: serviceName,
            error: err.message,
            method: req.method,
            path: req.url,
          },
          'Proxy error'
        );

        if (res && typeof (res as any).status === 'function') {
          (res as any).status(503).json({
            error: 'Service temporarily unavailable',
            service: serviceName,
          });
        }
      },
    },
  };

  return createProxyMiddleware(options);
};

export const authProxy = createProxy('auth', services.auth);
export const blockProxy = createProxy('block', services.block);
export const tableProxy = createProxy('table', services.block);
export const blogProxy = createProxy('blog', services.blog);
export const notificationProxy = createProxy('notification', services.notification);
