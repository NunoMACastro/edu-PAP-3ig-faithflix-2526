import { useEffect, useState } from "react";
import { ContentCarousel } from "../components/discovery/ContentCarousel.jsx";
import { discoveryApi } from "../services/api/discoveryApi.js";

export function DiscoveryHomePage() {
  const [carousels, setCarousels] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    discoveryApi.getHome()
      .then((response) => {
        setCarousels(response.carousels);
        setStatus("success");
      })
      .catch(() => {
        setError("Nao foi possivel carregar descoberta.");
        setStatus("error");
      });
  }, []);

  return (
    <main className="discovery-page">
      <h1>Descobrir</h1>
      {status === "loading" && <p>A carregar conteudos...</p>}
      {error && <p role="alert">{error}</p>}
      {status === "success" && carousels.every((carousel) => carousel.items.length === 0) && (
        <p>Ainda nao existem conteudos publicados para descoberta.</p>
      )}
      {carousels.map((carousel) => (
        <ContentCarousel key={carousel.id} title={carousel.title} items={carousel.items} />
      ))}
    </main>
  );
}