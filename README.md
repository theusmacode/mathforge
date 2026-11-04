# MathForge

Plataforma web modular de ferramentas matemáticas (React + TypeScript + Vite).

## Estado atual: Fase 1 (fundação)
Implementado: layout (sidebar, cabeçalho, busca global), dashboard, páginas de categoria, página de ferramenta, registro central e testes do registro/busca.
**Nenhuma ferramenta matemática está implementada ainda** — as 11 registradas aparecem como "planejada". Favoritos, histórico e gráficos chegam nas próximas fases.

## Pré-requisitos
Node.js 20 ou superior (`node -v`).

## Como executar
Dentro da pasta `MathForge` (a que contém `package.json`):
```
npm install
npm run dev      # abre em http://localhost:5173
npm test         # testes (Vitest)
npm run build    # checagem de tipos + build de produção em dist/
```

## Estrutura
- `src/registry/` — catálogo central (`category-registry.ts`, `tool-registry.ts`). Dashboard, categorias e busca leem daqui.
- `src/components/` — layout, busca, cards, breadcrumbs.
- `src/pages/` — Dashboard, CategoryPage, ToolPage, NotFound.
- `src/styles/global.css` — tokens de cor e estilos.
- `src/tests/` — testes.

## Como adicionar uma ferramenta
1. Em `tool-registry.ts`, adicione/edite uma linha `t(...)` (id único, categoria e subcategoria existentes).
2. Ela aparece sozinha no dashboard (contagem), na categoria e na busca.
3. Fase 2 definirá o contrato por ferramenta (lógica pura em `core/`, validação, UI, explicação e testes) e o mapa seguro `id → componente`.

## Limitações conhecidas
Sem ferramentas funcionais; sem persistência; busca por texto simples (sem IA); este código ainda não foi compilado nem testado pelo autor — rode `npm install && npm test && npm run build` e reporte qualquer erro.

## Estado atual
Ver `ROADMAP.md`, `ARCHITECTURE.md` e `INVENTARIO.md` (interface de cada ferramenta). Nada foi validado com `npm run build` ainda.
