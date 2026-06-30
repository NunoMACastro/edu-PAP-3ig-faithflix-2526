 Passo 1:
 Exemplo de estado:
    vazio:
        <section className="page-section narrow-section">
            <p className="section-kicker">Conta</p>
            <h1>A minha conta</h1>
            {error ? <EmptyState title="Não foi possível atualizar a conta" description={error} tone="error" /> : null}
            {status ? <EmptyState title="Alteração guardada" description={status} tone="success" /> : null}
    normal:
        async function loadItems() {
        const response = await catalogApi.listAdmin();
        setItems(response.items);
    }

    erro:
        async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setStatus("");

        try {
            await catalogApi.createContent({
                ...form,
                durationSeconds: Number(form.durationSeconds),
                ageRating: Number(form.ageRating),
            });
            setForm(EMPTY_FORM);
            setStatus("Conteúdo criado como rascunho.");
            await loadItems();
        } catch (requestError) {
            setError(requestError.message);
        }
    }


Passo 3:
erro:  CatalogPage.jsx
            {error ? (
                <EmptyState title="Não foi possível carregar o catálogo" description={error} tone="error" />
            ) : null}

loading: SearchPage.jsx
            {loading ? <p role="status">A pesquisar...</p> : null}

vazio: SearchPage.jsx
            {result && items.length === 0 ? (
                <EmptyState
                    title="Sem resultados para a pesquisa"
                    description="Experimenta retirar filtros ou pesquisar por outro título, tema ou categoria."
                />
            ) : null}
