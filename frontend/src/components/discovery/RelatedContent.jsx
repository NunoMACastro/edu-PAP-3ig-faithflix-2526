import { useEffect, useState } from "react";
import { discoveryApi } from "../../services/api/discoveryApi.js";
import { DiscoveryCarousel } from "./DiscoveryCarousel.jsx";

/**
 * Shows related published content for the current detail page.
 *
 * @param {{ contentId: string }} props - Component props.
 * @param {string} props.contentId - Current content id.
 * @returns {JSX.Element} Related content panel.
 */
export function RelatedContent({ contentId }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError("");

        discoveryApi
            .related(contentId)
            .then((response) => {
                if (active) {
                    setItems(response.items);
                }
            })
            .catch((requestError) => {
                if (active) {
                    setError(requestError.message);
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [contentId]);

    if (loading) {
        return <p>A carregar relacionados...</p>;
    }

    if (error) {
        return <p role="alert">{error}</p>;
    }

    return <DiscoveryCarousel title="Relacionados" items={items} />;
}
