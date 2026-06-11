import { useEffect, useState } from "react";
import { ContentCarousel } from "./ContentCarousel.jsx";
import { discoveryApi } from "../../services/api/discoveryApi.js";

export function RelatedContent({ contentId }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");

    discoveryApi.getRelated(contentId)
      .then((response) => {
        if (!active) return;
        setItems(response.items);
        setStatus("success");
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [contentId]);

  if (status === "loading") return <p>A carregar relacionados...</p>;
  if (items.length === 0) return null;

  return <ContentCarousel title="Relacionados" items={items} />;
}