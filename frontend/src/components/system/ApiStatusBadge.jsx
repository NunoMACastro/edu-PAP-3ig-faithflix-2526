/**
 * @file Ficheiro `real_dev/frontend/src/components/system/ApiStatusBadge.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { getApiStatus } from "../../services/api/systemApi.js";

/**
 * Badge técnico que mostra se o frontend consegue contactar o backend.
 *
 * @returns {JSX.Element} Badge de estado da conectividade à API.
 */
export function ApiStatusBadge() {
    const [state, setState] = useState({
        status: "checking",
        message: "A verificar ligacao ao backend...",
    });

    useEffect(() => {
        let isActive = true;

        /**
         * Carrega o estado do backend e atualiza o badge em segurança.
         *
         * @returns {Promise<void>} Termina depois de atualizar ou ignorar o estado.
         */
        async function loadApiStatus() {
            try {
                const data = await getApiStatus();

                if (!isActive) {
                    return;
                }

                setState({
                    status: "online",
                    message: `${data.name} ligada (${data.status}).`,
                });
            } catch (error) {
                if (!isActive) {
                    return;
                }

                setState({
                    status: "offline",
                    message: toUserMessage(error),
                });
            }
        }

        loadApiStatus();

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <aside
            className={`api-status api-status-${state.status}`}
            aria-live="polite"
        >
            <strong>Estado API</strong>
            <span>{state.message}</span>
        </aside>
    );
}
