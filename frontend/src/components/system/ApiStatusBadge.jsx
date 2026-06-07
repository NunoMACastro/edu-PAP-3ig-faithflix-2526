import { useEffect, useState } from "react";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { getApiStatus } from "../../services/api/systemApi.js";

/**
 * Technical badge that shows whether the frontend can reach the backend.
 *
 * @returns {JSX.Element} API connectivity status badge.
 */
export function ApiStatusBadge() {
    const [state, setState] = useState({
        status: "checking",
        message: "A verificar ligacao ao backend...",
    });

    useEffect(() => {
        let isActive = true;

        /**
         * Loads the backend status and updates the badge safely.
         *
         * @returns {Promise<void>} Resolves after the state is updated or skipped.
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
