import handler from '../../dist/server/server.js';

export default async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  const response = await handler.fetch(
    new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
    }),
    undefined,
    undefined
  );

  res.status(response.status);
  
  for (const [key, value] of response.headers) {
    res.setHeader(key, value);
  }
  
  return res.end(await response.text());
};

