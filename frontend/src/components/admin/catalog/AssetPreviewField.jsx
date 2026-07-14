/** @file Campo URL com pré-visualização editorial segura. */

import { useEffect, useState } from "react";

/**
 * @param {{label: string, value: string, onChange: (value: string) => void, kind?: "poster" | "backdrop" | "preview"}} props Propriedades do campo.
 * @returns {JSX.Element} Campo controlado e respetivo preview.
 */
export function AssetPreviewField({ label, value, onChange, kind = "poster" }) {
    const [invalid, setInvalid] = useState(false);

    useEffect(() => setInvalid(false), [value]);

    return (
        <div className={`asset-preview-field asset-preview-${kind}`}>
            <label>
                {label}
                <input
                    type={kind === "preview" ? "text" : "url"}
                    value={value}
                    placeholder={kind === "preview" ? "https://… ou /media/previews/…" : "https://…"}
                    onChange={(event) => onChange(event.target.value)}
                />
            </label>
            {value && kind !== "preview" ? (
                invalid ? (
                    <p className="asset-preview-error" role="status">Não foi possível apresentar esta imagem.</p>
                ) : (
                    <img src={value} alt="" onError={() => setInvalid(true)} />
                )
            ) : null}
        </div>
    );
}
