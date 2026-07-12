/**
 * @file Entrada da configuração Playwright funcional fail-closed.
 */

import { createFormalE2eConfig } from "./tests/e2e/formal-config.js";

export default createFormalE2eConfig(process.env);
