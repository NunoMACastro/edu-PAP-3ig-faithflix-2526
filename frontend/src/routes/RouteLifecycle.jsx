/**
 * @file Efeitos acessíveis executados quando muda a página do router.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resolveRouteTitle } from "./routeMetadata.js";

/**
 * Atualiza título, scroll e foco quando muda o pathname. Alterações apenas de
 * filtros/query mantêm o foco atual para não interromper interação na página.
 *
 * @returns {null} O componente gere apenas efeitos do documento.
 */
export function RouteLifecycle() {
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = resolveRouteTitle(pathname);

        const main = document.getElementById("conteudo-principal");
        main?.focus({ preventScroll: true });

        if (typeof window.scrollTo === "function") {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }
    }, [pathname]);

    return null;
}
