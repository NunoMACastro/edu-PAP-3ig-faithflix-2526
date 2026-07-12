/**
 * @file Confirmação acessível da subscrição FaithFlix.
 */

import { forwardRef } from "react";
import { compactPlanName, formatPlanPrice } from "./SubscriptionPlanCard.jsx";

/**
 * Confirma o plano escolhido antes de executar a subscrição.
 */
export const SubscriptionCheckoutDialog = forwardRef(function SubscriptionCheckoutDialog(
    { plan, submitting, error, onConfirm, onClose, onRequestClose },
    ref,
) {
    return (
        <dialog
            className="app-dialog subscription-checkout-dialog"
            ref={ref}
            aria-labelledby="subscription-checkout-title"
            aria-describedby="subscription-checkout-description"
            onClose={onClose}
            onCancel={(event) => {
                if (submitting) event.preventDefault();
            }}
        >
            <div className="subscription-checkout-dialog-inner">
                <header className="confirm-dialog-header">
                    <span className="confirm-dialog-symbol" aria-hidden="true">✓</span>
                    <div>
                        <p className="confirm-dialog-eyebrow">Confirmar escolha</p>
                        <h2 id="subscription-checkout-title">
                            {plan ? compactPlanName(plan.name) : "Plano FaithFlix"}
                        </h2>
                    </div>
                </header>
                <div className="confirm-dialog-body subscription-checkout-body">
                    {plan ? (
                        <p className="subscription-checkout-summary">
                            <strong>{formatPlanPrice(plan.priceCents, plan.currency)}</strong>
                            <span>/{plan.interval === "yearly" ? "ano" : "mês"}</span>
                        </p>
                    ) : null}
                    <p id="subscription-checkout-description">
                        Confirma a subscrição para ativares o plano selecionado na
                        tua conta.
                    </p>
                    {error ? (
                        <p className="status-message status-message-error" role="alert">
                            {error}
                        </p>
                    ) : null}
                </div>
                <div className="button-row confirm-dialog-actions subscription-checkout-actions">
                    <button
                        type="button"
                        className="confirm-dialog-cancel"
                        disabled={submitting}
                        onClick={onRequestClose}
                    >
                        Voltar
                    </button>
                    <button
                        type="button"
                        data-checkout-confirm
                        autoFocus
                        disabled={!plan || submitting}
                        onClick={onConfirm}
                    >
                        {submitting ? "A confirmar..." : "Confirmar subscrição"}
                    </button>
                </div>
            </div>
        </dialog>
    );
});
