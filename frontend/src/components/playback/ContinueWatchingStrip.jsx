import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { playbackApi } from "../../services/api/playbackApi.js";

function progressPercent(item) {
  if (!item.durationSeconds) return 0;
  return Math.round((item.currentTimeSeconds / item.durationSeconds) * 100);
}

export function ContinueWatchingStrip() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    playbackApi.listContinueWatching()
      .then((response) => setItems(response.items))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section aria-label="Continuar a ver">
      <h2>Continuar a ver</h2>
      <div className="content-row">
        {items.map((item) => (
          <article key={item.id}>
            <img src={item.posterUrl} alt="" />
            <h3>{item.title}</h3>
            <progress max="100" value={progressPercent(item)} />
            <Link to={`/ver/${item.id}`}>Continuar</Link>
          </article>
        ))}
      </div>
    </section>
  );
}