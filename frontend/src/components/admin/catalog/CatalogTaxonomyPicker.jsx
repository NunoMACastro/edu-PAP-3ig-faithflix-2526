/** @file Seletor pesquisável de taxonomias com chips e checkboxes. */

import { useState } from "react";

/**
 * @param {{items: Array<{id: string, name: string}>, selectedIds: string[], onChange: (ids: string[]) => void}} props Propriedades do seletor.
 * @returns {JSX.Element} Classificação editorial acessível.
 */
export function CatalogTaxonomyPicker({ items, selectedIds, onChange }) {
    const [search, setSearch] = useState("");
    const normalized = search.trim().toLocaleLowerCase("pt-PT");
    const visible = items.filter((item) =>
        item.name.toLocaleLowerCase("pt-PT").includes(normalized),
    );
    const selected = items.filter((item) => selectedIds.includes(item.id));

    function toggle(id) {
        onChange(
            selectedIds.includes(id)
                ? selectedIds.filter((value) => value !== id)
                : [...selectedIds, id],
        );
    }

    return (
        <div className="taxonomy-picker">
            {selected.length ? (
                <div className="taxonomy-chips" aria-label="Taxonomias selecionadas">
                    {selected.map((item) => (
                        <button key={item.id} type="button" onClick={() => toggle(item.id)}>
                            {item.name} <span aria-hidden="true">×</span>
                            <span className="visually-hidden">Remover</span>
                        </button>
                    ))}
                </div>
            ) : <p className="form-help">Ainda não selecionaste taxonomias.</p>}
            <label>
                Pesquisar taxonomias
                <input value={search} maxLength={80} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <div className="taxonomy-options">
                {visible.map((item) => (
                    <label key={item.id} className="checkbox-row">
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggle(item.id)}
                        />
                        {item.name}
                    </label>
                ))}
                {!visible.length ? <p className="form-help">Sem taxonomias correspondentes.</p> : null}
            </div>
        </div>
    );
}
