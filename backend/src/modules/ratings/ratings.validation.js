import { ObjectId } from "mongodb";

export function asObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    const error = new Error(`${label} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

export function assertRatingValue(value) {
  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    const error = new Error("O rating deve ser um inteiro entre 1 e 5.");
    error.statusCode = 400;
    throw error;
  }

  return rating;
}