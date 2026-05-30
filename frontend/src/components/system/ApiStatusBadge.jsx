import { useEffect, useState } from "react";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { getApiStatus } from "../../services/api/systemApi.js";

export function ApiStatusBadge() {
    const [state, setState] = useState({
        status: "checking",
        message: "A verificar ligacao ao backend...",
    });

    useEffect(() => {
        let isActive = true;

        getApiStatus()
            .then((data) => {
                if (!isActive) {
                    return;
                }

                setState({
                    status: "online",
                    message: `${data.name} ligada (${data.status}).`,
                });
            })
            .catch((error) => {
                if (!isActive) {
                    return;
                }

                setState({
                    status: "offline",
                    message: toUserMessage(error),
                });
            });

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