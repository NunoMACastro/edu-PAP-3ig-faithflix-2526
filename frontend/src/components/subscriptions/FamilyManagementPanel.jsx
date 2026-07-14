/**
 * @file Gestão familiar compacta da página de planos.
 */

const familyStatusLabels = {
    pending: "Convite pendente",
    active: "Membro ativo",
    removed: "Removido",
};

/**
 * Mostra o nome seguro de um utilizador familiar.
 *
 * @param {object|null} user Utilizador reduzido.
 * @returns {string} Nome ou email.
 */
export function familyUserLabel(user) {
    return user?.name || user?.email || "Utilizador";
}

/**
 * Mantém as operações familiares numa área privada distinta da comparação.
 *
 * @returns {JSX.Element} Painel familiar do owner, convite ou membro.
 */
export function FamilyManagementPanel({
    ownedFamily,
    pendingInvitations,
    activeMembership,
    inviteEmail,
    setInviteEmail,
    submitting,
    onInvite,
    onRemove,
    onAccept,
    onDecline,
    onLeave,
}) {
    return (
        <section className="subscription-family-section" aria-labelledby="subscription-family-title">
            <div className="subscription-section-heading">
                <div>
                    <p className="section-kicker">Partilha</p>
                    <h2 id="subscription-family-title">A tua família FaithFlix</h2>
                </div>
                {ownedFamily ? (
                    <p>{ownedFamily.seatsUsed}/{ownedFamily.maxFamilyMembers} lugares usados.</p>
                ) : null}
            </div>

            {ownedFamily ? (
                <div className="subscription-family-owner">
                    <form className="subscription-family-invite app-form app-form--standard" onSubmit={onInvite}>
                        <label>
                            Convidar por email
                            <input
                                type="email"
                                maxLength="254"
                                value={inviteEmail}
                                onChange={(event) => setInviteEmail(event.target.value)}
                                required
                                placeholder="nome@example.com"
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={submitting || ownedFamily.seatsAvailable <= 0}
                        >
                            Convidar
                        </button>
                    </form>
                    {ownedFamily.members.length ? (
                        <div className="subscription-family-list">
                            {ownedFamily.members.map((member) => (
                                <article className="subscription-family-person" key={member.id}>
                                    <div>
                                        <span>{familyStatusLabels[member.status] ?? "Estado indisponível"}</span>
                                        <h3>{familyUserLabel(member.member)}</h3>
                                        <p>{member.invitedEmail}</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="button-secondary"
                                        disabled={submitting}
                                        onClick={() => onRemove(member)}
                                    >
                                        Remover
                                    </button>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="subscription-family-note">Ainda não existem membros ou convites pendentes.</p>
                    )}
                </div>
            ) : null}

            {pendingInvitations.length ? (
                <div className="subscription-family-list">
                    {pendingInvitations.map((invitation) => (
                        <article className="subscription-family-person" key={invitation.id}>
                            <div>
                                <span>Convite pendente</span>
                                <h3>{familyUserLabel(invitation.owner)}</h3>
                                <p>{invitation.owner?.email}</p>
                            </div>
                            <div className="subscription-family-actions">
                                <button type="button" disabled={submitting} onClick={() => onAccept(invitation)}>
                                    Aceitar
                                </button>
                                <button
                                    type="button"
                                    className="button-secondary"
                                    disabled={submitting}
                                    onClick={() => onDecline(invitation)}
                                >
                                    Recusar
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            ) : null}

            {activeMembership ? (
                <article className="subscription-family-person subscription-family-membership">
                    <div>
                        <span>Membro ativo</span>
                        <h3>{familyUserLabel(activeMembership.owner)}</h3>
                        <p>{activeMembership.owner?.email}</p>
                    </div>
                    <button
                        type="button"
                        className="button-secondary"
                        disabled={submitting}
                        onClick={onLeave}
                    >
                        Sair da família
                    </button>
                </article>
            ) : null}
        </section>
    );
}
