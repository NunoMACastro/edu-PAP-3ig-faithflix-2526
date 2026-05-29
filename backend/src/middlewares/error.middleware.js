export function notFound(req, _res, next) {
  next(createHttpError(404, `Rota nao encontrada: ${req.method} ${req.originalUrl}`));
}