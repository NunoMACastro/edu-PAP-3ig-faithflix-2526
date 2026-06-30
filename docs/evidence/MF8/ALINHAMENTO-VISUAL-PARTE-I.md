# MF8 - Alinhamento Visual Parte I
Referência: BK-MF8-01  
Data: 2026-06-29  
Estado global: INCOMPLETO (dependente de execução de inspeção real do frontend + mockups)

---

# Passo 1 - Comparar mockup e frontend real

## Objetivo
Comparar ecrãs do mockup com o frontend real e registar diferenças visuais com prova.

## Tabela de alinhamento

| Ecrã | Mockup | Frontend | Diferença | Decisão | Prioridade | Prova |
|------|--------|-----------|------------|----------|-------------|--------|
| Header | NÃO VERIFICADO | NÃO VERIFICADO | Não inspecionado | NAO_VERIFICADO | Alta | sem screenshot |
| Navegação | NÃO VERIFICADO | NÃO VERIFICADO | Não inspecionado | NAO_VERIFICADO | Alta | sem screenshot |
| Hero | NÃO VERIFICADO | NÃO VERIFICADO | Não inspecionado | NAO_VERIFICADO | Alta | sem screenshot |
| Home | NÃO VERIFICADO | NÃO VERIFICADO | Não inspecionado | NAO_VERIFICADO | Alta | sem screenshot |

## Decisão técnica
Não foi possível executar revisão visual real de:
- mockup/
- frontend/src/
- MF7 evidence

Risco: comparação inválida sem prova visual
Contrato BK protegido: BK-MF8-01 exige prova observável

## Validação
FAIL — ausência total de prova verificável

---

# Passo 2 - Normalizar tokens visuais

## Objetivo
Mapear cores, tipografia, espaçamentos e raios para tokens existentes em frontend/src/styles/.

## Observação
Sem inspeção do código-fonte não é possível validar:
- tokens existentes
- duplicação de valores
- drift visual

## Resultado
NAO_VERIFICADO

## Risco
- drift de design system
- inconsistência entre páginas

## Validação
FAIL — sem verificação de tokens reais

---

# Passo 3 - Alinhar header e navegação

## Objetivo
Validar logo, links, estados autenticado/visitante e acessibilidade de navegação.

## Observação
Sem inspeção de:
- frontend/src/components/layout/
- rotas autenticadas vs públicas

## Estado
NAO_VERIFICADO

## Cenário negativo esperado (não validado)
- links protegidos visíveis para visitantes
- ausência de estados hover/focus consistentes

## Validação
FAIL — sem prova de execução

---

# Passo 4 - Alinhar hero e home

## Objetivo
Validar hierarquia visual do primeiro viewport.

## Observação
Não foi possível verificar:
- hero real
- CTA
- carregamento
- acessibilidade (focus / contraste)

## Estado
NAO_VERIFICADO

## Riscos
- hierarquia visual incorreta
- CTA pouco visível
- problemas de contraste

## Validação
FAIL — sem screenshot ou inspeção

---

# Passo 5 - Registar evidence antes/depois

## Objetivo
Registar evolução visual com prova (antes/depois).

## Estado
Sem dados disponíveis:
- sem screenshots antes
- sem screenshots depois
- sem rota ou viewport

## Resultado
NAO_VERIFICADO

## Validação
FAIL — evidence incompleta

---

# Passo 6 - Validar critérios mensuráveis

## Objetivo
Converter observações em critérios verificáveis (RNF).

## Estado
Não existem critérios derivados de inspeção real.

## RNF

| RNF | Critério | Estado |
|-----|----------|--------|
| RNF-UI-01 Header consistente | não verificado | FAIL |
| RNF-UI-02 Navegação funcional | não verificado | FAIL |
| RNF-UI-03 Hero acessível | não verificado | FAIL |

## Validação
FAIL — critérios sem prova associada

---

# Passo 7 - Preparar handoff para Parte II

## Decisões fechadas
Nenhuma decisão pode ser considerada fechada sem inspeção real.

## Riscos identificados
- ausência de baseline visual validado
- impossibilidade de comparar mockup vs frontend
- drift de design não detetado

## Continuação (Parte II)
A Parte II deve focar:
- revisão visual real com screenshots
- validação de tokens reais em frontend/src/styles/
- validação de navegação autenticada
- validação de hero com acessibilidade

## Owner
Frontend / UX validation pipeline (pendente atribuição real)

## Estado final
BLOQUEADO — depende de execução de inspeção visual real

---

# Validação final

scripts/validate-planificacao.sh: NÃO EXECUTADO  
git diff --check: NÃO EXECUTADO  

---

# Conclusão

Este artefacto está estruturado, mas **não validado**, pois não houve execução de inspeção real do mockup nem do frontend.

Próximo passo obrigatório:
Executar inspeção real (screenshots + análise de código) antes de marcar qualquer PASS.