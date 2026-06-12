import { apiClient } from "./apiClient.js";

function buildSearchParams(input) {
    const params = new URLSearchParams();

    params.set("q", input.query);
    params.set("page", String(input.page ?? 1));
    params.set("limit", String(input.limit ?? 12));
    params.set("sort", input.sort ?? "title");

    if (input.type) {
        params.set("type", input.type);
    }

    if (input.taxonomyId) {
        params.set("taxonomyId", input.taxonomyId);
    }

    return params;
}

export const searchApi = {
    search(input) {
        return apiClient.get(`/api/search?${buildSearchParams(input)}`);
    },
};
