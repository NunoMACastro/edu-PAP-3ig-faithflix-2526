import { apiClient } from "./apiClient.js";

export const commentsApi = {
    list(contentId) {
        return apiClient.get(`/api/comments/${encodeURIComponent(contentId)}`);
    },
    create(contentId, body) {
        return apiClient.post(
            `/api/comments/${encodeURIComponent(contentId)}`,
            { body },
        );
    },
    remove(commentId) {
        return apiClient.del(`/api/comments/${encodeURIComponent(commentId)}`);
    },
    moderate(commentId, input) {
        return apiClient.patch(
            `/api/comments/${encodeURIComponent(commentId)}/moderation`,
            input,
        );
    },
};
