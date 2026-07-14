/**
 * @file Card editorial das associações públicas FaithFlix.
 */

import { Link } from "react-router-dom";

/**
 * Produz um monograma curto a partir das primeiras palavras significativas.
 *
 * @param {string} name Nome público da associação.
 * @returns {string} Uma ou duas letras, com fallback neutro.
 */
export function charityMonogram(name) {
    const words = String(name ?? "")
        .trim()
        .split(/\s+/u)
        .filter(Boolean)
        .filter((word) => !["associação", "associacao"].includes(
            word.toLocaleLowerCase("pt-PT"),
        ));

    return words.slice(0, 2).map((word) => word[0]?.toLocaleUpperCase("pt-PT"))
        .join("") || "FF";
}

/**
 * Aceita apenas destinos web explícitos e seguros para um link externo.
 *
 * @param {unknown} value URL recebida da API.
 * @returns {string} URL HTTP(S) ou string vazia.
 */
export function safeCharityWebsite(value) {
    if (typeof value !== "string" || !value.trim()) return "";

    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
    } catch {
        return "";
    }
}

/**
 * Apresenta uma associação sem reutilizar a linguagem visual dos conteúdos.
 *
 * @param {{ charity: object, historyTo?: string }} props Propriedades do card.
 * @param {object} props.charity Associação pública.
 * @param {string} [props.historyTo] Histórico visível apenas para administradores.
 * @returns {JSX.Element} Card editorial acessível.
 */
export function PublicCharityCard({ charity, historyTo }) {
    const websiteUrl = safeCharityWebsite(charity.websiteUrl);
    const approvedDate = charity.approvedAt ? new Date(charity.approvedAt) : null;
    const approvedYear = approvedDate && !Number.isNaN(approvedDate.getTime())
        ? approvedDate.getFullYear()
        : null;

    return (
        <article className="public-charity-card">
            <div className="public-charity-card-heading">
                <span className="public-charity-monogram" aria-hidden="true">
                    {charityMonogram(charity.name)}
                </span>
                <div>
                    <p className="public-charity-eyebrow">Associação apoiada</p>
                    <h3>{charity.name}</h3>
                </div>
            </div>
            {charity.mission ? (
                <p className="public-charity-mission">{charity.mission}</p>
            ) : null}
            <div className="public-charity-card-footer">
                {approvedYear ? (
                    <span className="public-charity-since">
                        Na pool desde {approvedYear}
                    </span>
                ) : <span />}
                <div className="public-charity-links">
                    {websiteUrl ? (
                        <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Visitar website: ${charity.name}`}
                        >
                            Visitar website <span aria-hidden="true">↗</span>
                        </a>
                    ) : null}
                    {historyTo ? (
                        <Link
                            to={historyTo}
                            aria-label={`Consultar histórico: ${charity.name}`}
                        >
                            Consultar histórico
                        </Link>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
