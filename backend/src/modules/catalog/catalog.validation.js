import { ObjectId } from "mongodb";

export const CONTENT_TYPES = ["movie", "series", "episode", "documentary"];
export const CONTENT_STATUS = ["draft", "published", "archived"];

function requiredText(value, field, min = 2, max = 160) {
  const text = String(value ?? "").trim();

  if (text.length < min || text.length > max) {
    const error = new Error(`${field} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return text;
}

function optionalText(value, max = 500) {
  const text = String(value ?? "").trim();
  return text.length > max ? text.slice(0, max) : text;
}

function positiveInteger(value, field) {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    const error = new Error(`${field} deve ser um inteiro positivo.`);
    error.statusCode = 400;
    throw error;
  }

  return number;
}

function assertAgeRating(value) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 0 || number > 18) {
    const error = new Error("Classificacao etaria invalida.");
    error.statusCode = 400;
    throw error;
  }

  return number;
}

function taxonomyObjectIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((id) => {
    if (!ObjectId.isValid(id)) {
      const error = new Error("Taxonomia invalida.");
      error.statusCode = 400;
      throw error;
    }

    return new ObjectId(id);
  });
}

function mediaTrack(track) {
  return {
    language: requiredText(track.language, "language", 2, 12),
    label: requiredText(track.label, "label", 2, 80),
    src: requiredText(track.src, "src", 1, 500),
  };
}

function qualityOption(option) {
  return {
    label: requiredText(option.label, "label", 2, 40),
    value: requiredText(option.value, "value", 2, 40),
    playbackUrl: requiredText(option.playbackUrl, "playbackUrl", 1, 500),
  };
}

export function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function assertMediaOptions(input) {
  return {
    tracks: {
      subtitles: Array.isArray(input.tracks?.subtitles)
        ? input.tracks.subtitles.map(mediaTrack)
        : [],
      audio: Array.isArray(input.tracks?.audio)
        ? input.tracks.audio.map(mediaTrack)
        : [],
    },
    qualityOptions: Array.isArray(input.qualityOptions)
      ? input.qualityOptions.map(qualityOption)
      : [],
  };
}

export function assertCatalogPayload(input) {
  const title = requiredText(input.title, "title");
  const type = String(input.type ?? "").trim();

  if (!CONTENT_TYPES.includes(type)) {
    const error = new Error("Tipo de conteudo invalido.");
    error.statusCode = 400;
    throw error;
  }

  const slug = input.slug ? slugify(input.slug) : slugify(title);

  if (!slug) {
    const error = new Error("Slug invalido.");
    error.statusCode = 400;
    throw error;
  }

  return {
    title,
    slug,
    synopsis: requiredText(input.synopsis, "synopsis", 20, 1000),
    type,
    durationSeconds: positiveInteger(input.durationSeconds, "durationSeconds"),
    ageRating: assertAgeRating(input.ageRating ?? 0),
    taxonomyIds: taxonomyObjectIds(input.taxonomyIds),
    assets: {
      posterUrl: optionalText(input.assets?.posterUrl),
      backdropUrl: optionalText(input.assets?.backdropUrl),
    },
    media: {
      playbackUrl: requiredText(input.media?.playbackUrl, "media.playbackUrl", 1, 500),
    },
    ...assertMediaOptions(input),
  };
}

export function assertStatus(status) {
  const normalized = String(status ?? "").trim();

  if (!CONTENT_STATUS.includes(normalized)) {
    const error = new Error("Estado de conteudo invalido.");
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

export function assertTaxonomyPayload(input) {
  const name = requiredText(input.name, "name", 2, 80);

  return {
    name,
    slug: input.slug ? slugify(input.slug) : slugify(name),
    description: optionalText(input.description),
  };
}