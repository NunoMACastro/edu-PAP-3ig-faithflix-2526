/**
 * @file Ficheiro `real_dev/frontend/src/components/discovery/RelatedContent.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { discoveryApi } from "../../services/api/discoveryApi.js";
import { DiscoveryCarousel } from "./DiscoveryCarousel.jsx";

/**
 * Mostra conteúdo publicado relacionado para a página de detalhe atual.
 *
 * @param {{ contentId: string }} props - Propriedades do componente.
 * @param {string} props.contentId - Id do conteúdo atual.
 * @returns {JSX.Element} Painel de conteúdo relacionado.
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
