const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Initialize Next.js app
const app = next({
  dev: false,
  customServer: true,
  dir: __dirname,
});

const handle = app.getRequestHandler();

let server;

async function startServer() {
  if (!server) {
    await app.prepare();
    
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });
  }
  return server;
}

// AWS Lambda handler
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  const server = await startServer();
  
  return new Promise((resolve, reject) => {
    const req = {
      method: event.httpMethod || event.requestContext?.http?.method || 'GET',
      url: event.path || event.rawPath || '/',
      headers: event.headers || {},
      body: event.body,
    };

    // Handle query parameters
    if (event.queryStringParameters) {
      const queryString = new URLSearchParams(event.queryStringParameters).toString();
      if (queryString) {
        req.url += (req.url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      isBase64Encoded: false,
      
      writeHead(statusCode, headers = {}) {
        this.statusCode = statusCode;
        this.headers = { ...this.headers, ...headers };
      },
      
      setHeader(name, value) {
        this.headers[name] = value;
      },
      
      getHeader(name) {
        return this.headers[name];
      },
      
      write(chunk) {
        this.body += chunk;
      },
      
      end(chunk) {
        if (chunk) this.body += chunk;
        
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body,
          isBase64Encoded: this.isBase64Encoded,
        });
      },
    };

    // Simulate the HTTP request/response cycle
    handle(req, res);
  });
};