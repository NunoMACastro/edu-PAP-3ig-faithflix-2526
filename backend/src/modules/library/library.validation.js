import { ObjectId } from "mongodb";

export const LIST_TYPES = ["favorite", "watchlist"];

export function asObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    const error = new Error(`${label} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

export function assertListType(type) {
  if (!LIST_TYPES.includes(type)) {
    const error = new Error("Tipo de lista invalido.");
    error.statusCode = 400;
    throw error;
  }

  return type;
}