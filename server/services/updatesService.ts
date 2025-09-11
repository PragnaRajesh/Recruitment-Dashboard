import { Request, Response } from 'express';

const clients: Set<Response> = new Set();

export function registerSse(res: Response) {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Send a comment to establish the stream
  res.write(':ok\n\n');

  clients.add(res);

  // Remove on close
  res.on('close', () => {
    clients.delete(res);
    try { res.end(); } catch (e) {}
  });
}

export function broadcast(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((res) => {
    try {
      res.write(payload);
    } catch (e) {
      clients.delete(res);
    }
  });
}

export function getClientsCount() {
  return clients.size;
}
