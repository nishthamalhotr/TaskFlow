import server from '../../dist/server/server.js';

export default async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Build Web API Request
    const body = ['GET', 'HEAD'].includes(req.method) 
      ? undefined 
      : req.body || req;
    
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body,
    });
    
    // Call the server handler
    const response = await server.fetch(request, undefined, {});
    
    // Set response status
    res.status(response.status);
    
    // Copy headers
    response.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });
    
    // Send body
    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error?.message 
    });
  }
};

