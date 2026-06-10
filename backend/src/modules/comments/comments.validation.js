import { ObjectId } from "mongodb";

export const COMMENT_STATUS = ["visible", "pending_review", "rejected"];

export function asObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    const error = new Error(`${label} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

export function assertCommentBody(value) {
  const body = String(value ?? "").replace(/\s+/g, " ").trim();

  if (body.length < 3 || body.length > 280) {
    const error = new Error("O comentario deve ter entre 3 e 280 caracteres.");
    error.statusCode = 400;
    throw error;
  }

  return body;
}

export function initialModerationFor(body) {
  const lower = body.toLowerCase();
  const hasLink = lower.includes("http://") || lower.includes("https://") || lower.includes("www.");

  if (hasLink) {
    return {
      status: "pending_review",
      moderationReason: "Comentario com link aguarda revisao.",
    };
  }

  return {
    status: "visible",
    moderationReason: null,
  };
}

export function assertModerationStatus(value) {
  const status = String(value ?? "").trim();

  if (!COMMENT_STATUS.includes(status)) {
    const error = new Error("Estado de moderacao invalido.");
    error.statusCode = 400;
    throw error;
  }

  return status;
}