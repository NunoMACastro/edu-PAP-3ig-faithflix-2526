import { getMyProfile, listUsers, updateMyProfile, updateUserRole } from "./user.service.js";

export async function getMe(req, res) {
  res.status(200).json({ user: await getMyProfile(req.user.id) });
}

export async function patchMe(req, res) {
  res.status(200).json({ user: await updateMyProfile(req.user.id, req.body) });
}

export async function getUsers(req, res) {
  res.status(200).json({ users: await listUsers() });
}

export async function patchUserRole(req, res) {
  res.status(200).json({ user: await updateUserRole(req.params.id, req.body) });
}