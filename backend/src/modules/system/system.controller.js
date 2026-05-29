export function getApiInfo(req, res) {
  res.json({
    service: 'faithflix-api',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}