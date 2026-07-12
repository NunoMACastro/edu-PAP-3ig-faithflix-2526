/**
 * @file Ponto de arranque HTTP da API FaithFlix.
 *
 * Prepara os índices essenciais antes de aceitar tráfego, para que as rotas
 * possam assumir constraints de autenticação, catálogo, subscrições e pool
 * solidária. Este entry point não executa seeds.
 */

import { createApp } from "./app.js";
import {
  assertTransactionSupport,
  closeDatabase,
} from "./config/database.js";
import { env } from "./config/env.js";
import { ensureApplicationIndexes } from "./bootstrap/ensure-application-indexes.js";
import {
  createGracefulShutdown,
  installSignalHandlers,
} from "./runtime/graceful-shutdown.js";
import { logger } from "./utils/logger.js";

// Todas as mutações reais dependem de transações; falhar antes de aceitar tráfego.
await assertTransactionSupport();
// Os índices são preparados antes do `listen` para evitar janelas com constraints ausentes.
await ensureApplicationIndexes();

const app = createApp();

const server = app.listen(env.port, env.host, () => {
  logger.info("FaithFlix API started", {
    host: env.host,
    port: env.port,
  });
});

const shutdown = createGracefulShutdown({
  server,
  closeDatabase,
  logger,
});
let removeSignalHandlers = () => {};

removeSignalHandlers = installSignalHandlers({
  onSignal: async (signal) => {
    try {
      await shutdown(signal);
    } finally {
      removeSignalHandlers();
    }
  },
  onError: (error, signal) => {
    logger.error("FaithFlix API shutdown failed", {
      signal,
      code: error?.code ?? "GRACEFUL_SHUTDOWN_FAILED",
    });
    process.exitCode = 1;
    removeSignalHandlers();
  },
});
