/**
 * Módulo da página privada de histórico por associação.
 *
 * Usa o `charityId` da rota para consultar o histórico autorizado pelo backend,
 * onde admin e membership determinam quem pode ver os valores.
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Página privada de histórico de uma associação.
 *
 * @returns {JSX.Element} Totais e linhas mensais da associação permitida.
 */
export function CharityHistoryPage() {
  const { charityId } = useParams();
  const [history, setHistory] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    /**
     * Carrega histórico já protegido pelo backend.
     *
     * @returns {Promise<void>}
     */
    async function loadHistory() {
      setError("");
      try {
        const response = await charitiesApi.getCharityHistory(charityId);
        setHistory(response);
      } catch (apiError) {
        setError(toUserMessage(apiError));
      }
    }

    loadHistory();
  }, [charityId]);

  return (
    <main>
      <h1>Histórico da associação</h1>
      {error && <p role="alert">{error}</p>}
      {!history && !error && <p>A carregar histórico...</p>}
      {history && (
        <>
          <p>Total recebido: {(history.totalCents / 100).toFixed(2)} EUR</p>
          {history.rows.length === 0 && <p>Sem distribuicoes registadas.</p>}
          {history.rows.map((row) => (
            <article key={row.month}>
              <h2>{row.month}</h2>
              <p>Valor: {(row.amountCents / 100).toFixed(2)} EUR</p>
              <p>Posicao na rotação: {row.rotationPosition}</p>
            </article>
          ))}
        </>
      )}
    </main>
  );
}