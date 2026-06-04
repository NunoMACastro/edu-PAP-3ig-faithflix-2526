import { getSessionCookieOptions } from "../../config/session.js";
import { clearSessionCookie } from "../../utils/cookies.js";
import { deleteSession } from "./session.service.js";
import { loginUser, registerUser, requestPasswordReset, resetPassword } from "./auth.service.js";

function setSessionCookie(res, token) {
  res.cookie(process.env.SESSION_COOKIE_NAME ?? "faithflix_session", token, getSessionCookieOptions());
}

export async function register(req, res) {
  const result = await registerUser(req.body);
  setSessionCookie(res, result.token);
  res.status(201).json({ user: result.user });
}

export async function login(req, res) {
  const result = await loginUser(req.body);
  setSessionCookie(res, result.token);
  res.status(200).json({ user: result.user });
}

export async function me(req, res) {
  res.status(200).json({ user: req.user ?? null });
}

export async function forgotPassword(req, res) {
  res.status(200).json(await requestPasswordReset(req.body));
}

export async function resetPasswordController(req, res) {
  res.status(200).json(await resetPassword(req.body));
}

export async function logout(req, res) {
  await deleteSession(req.session?.token);
  clearSessionCookie(res);
  res.status(204).send();
}