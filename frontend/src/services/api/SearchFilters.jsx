export function SearchFilters({ value, taxonomies, onChange }) {
  return (
    <fieldset className="search-filters">
      <legend>Filtros</legend>

      <label>
        Tipo
        <select value={value.type} onChange={(event) => onChange({ ...value, type: event.target.value })}>
          <option value="">Todos</option>
          <option value="movie">Filme</option>
          <option value="series">Serie</option>
          <option value="episode">Episodio</option>
          <option value="documentary">Documentario</option>
        </select>
      </label>

      <label>
        Tema
        <select value={value.taxonomyId} onChange={(event) => onChange({ ...value, taxonomyId: event.target.value })}>
          <option value="">Todos</option>
          {taxonomies.map((taxonomy) => (
            <option key={taxonomy.id} value={taxonomy.id}>{taxonomy.name}</option>
          ))}
        </select>
      </label>

      <label>
        Ordenar
        <select value={value.sort} onChange={(event) => onChange({ ...value, sort: event.target.value })}>
          <option value="title">Titulo</option>
          <option value="recent">Recentes</option>
          <option value="rating">Melhor avaliados</option>
        </select>
      </label>
    </fieldset>
  );
}