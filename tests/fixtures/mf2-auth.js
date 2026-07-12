/**
 * @file Identificadores reservados para os fluxos E2E de identidade MF2.
 *
 * Estes valores pertencem exclusivamente à base MongoDB terminada em `_e2e`.
 * O token raw é partilhado entre seed e browser para provar o reset sem criar
 * qualquer endpoint ou exposição pública de credenciais de recuperação.
 */

export const MF2_REGISTER_EMAIL = "register-mf2@faithflix.test";
export const MF2_REGISTER_PASSWORD = "registo-seguro-123";
export const MF2_RESET_EMAIL = "reset-mf2@faithflix.test";
export const MF2_RESET_OLD_PASSWORD = "password-antiga-123";
export const MF2_RESET_NEW_PASSWORD = "password-nova-456";
export const MF2_RESET_TOKEN = "a".repeat(64);
