/**
 * @file Boundary reutilizável para falhas de renderização no frontend.
 */

import { Component } from "react";

const HEALTHY_STATE = Object.freeze({ hasError: false });

/**
 * Mantém uma falha de página dentro do conteúdo principal sem expor detalhes
 * técnicos, stack traces ou mensagens potencialmente sensíveis ao utilizador.
 */
export class ErrorBoundary extends Component {
    state = HEALTHY_STATE;

    /**
     * Ativa o fallback seguro quando um descendente falha ao renderizar.
     *
     * @returns {{ hasError: true }} Estado de erro sem conservar a exceção.
     */
    static getDerivedStateFromError() {
        return { hasError: true };
    }

    /**
     * Limpa uma falha anterior quando o router muda de entrada.
     *
     * @param {{ resetKey?: string }} previousProps Propriedades anteriores.
     * @returns {void}
     */
    componentDidUpdate(previousProps) {
        if (
            this.state.hasError &&
            previousProps.resetKey !== this.props.resetKey
        ) {
            this.setState(HEALTHY_STATE);
        }
    }

    /**
     * Entrega a exceção apenas a um observador explícito, sem a apresentar.
     * Uma falha do observador não pode derrubar o próprio fallback.
     *
     * @param {unknown} error Erro capturado pelo React.
     * @param {React.ErrorInfo} errorInfo Contexto de componentes do React.
     * @returns {void}
     */
    componentDidCatch(error, errorInfo) {
        try {
            this.props.onError?.(error, errorInfo);
        } catch (_observerError) {
            // Telemetria opcional nunca deve substituir o fallback seguro.
        }
    }

    /**
     * Executa a recuperação fornecida e volta a tentar renderizar a árvore.
     * Se a recuperação falhar, conserva o fallback em vez de propagar o erro.
     *
     * @returns {void}
     */
    handleRetry = () => {
        try {
            this.props.onRetry?.();
        } catch (_retryError) {
            return;
        }

        this.setState(HEALTHY_STATE);
    };

    /**
     * @returns {React.ReactNode} Conteúdo normal ou fallback seguro.
     */
    render() {
        if (this.state.hasError) {
            return (
                <section className="page-section narrow-section" role="alert">
                    <h1>Não foi possível apresentar esta página</h1>
                    <p>
                        Ocorreu um erro inesperado. Tente novamente para
                        recuperar esta área.
                    </p>
                    <button type="button" onClick={this.handleRetry}>
                        Tentar novamente
                    </button>
                </section>
            );
        }

        return this.props.children;
    }
}
