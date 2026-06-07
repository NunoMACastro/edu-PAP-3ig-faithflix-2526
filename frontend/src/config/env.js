const rawApiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

/**
 * Frontend environment configuration exposed by Vite.
 *
 * @type {{ apiBaseUrl: string }}
 */
export const env = {
    // Removing one trailing slash prevents accidental URLs such as //api.
    apiBaseUrl: rawApiBaseUrl.replace(/\/$/, ""),
};
