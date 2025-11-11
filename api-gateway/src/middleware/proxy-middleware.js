

const proxy = require('express-http-proxy');
const logger = require('../utils/logger');

const defaultProxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, '/api');
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      success: false,
      message: `Internal server error`,
      error: err.message,
    });
  },
};


const proxyMiddleware = (targetUrl, customOptions = {}) => {
    const mergedOptions = {
         ...defaultProxyOptions,
         ...customOptions 
    };
    return proxy(targetUrl, mergedOptions);
};


module.exports = proxyMiddleware;
