<script lang="ts">
  import type { CardType, KnowledgeNode } from '#lib/types';
  import { allNodes, allNodesEverywhere, app, openNode, scopeLabel, speciesList } from '#lib/store.svelte';
  import { focusTrap } from '#lib/focus';
  import {
    Check,
    CircleQuestionMark,
    FileText,
    Heart,
    Package,
    Search,
    StickyNote,
    X
  } from '@lucide/svelte';

  let typeFilter = $state<CardType | null>(null);
  let speciesFilter = $state<string | null>(null);
  let onlyUnconfirmed = $state(false);

  const types: { id: CardType; label: string }[] = [
    { id: 'hecho', label: 'Datos' },
    { id: 'supuesto', label: 'Suposiciones' },
    { id: 'preferencia', label: 'Preferencias' },
    { id: 'artefacto', label: 'Materiales' }
  ];
  const typeName: Record<CardType, string> = {
    hecho: 'Dato',
    supuesto: 'Suposición',
    preferencia: 'Preferencia',
    artefacto: 'Material'
  };
  const typeIcons = { hecho: Check, supuesto: CircleQuestionMark, preferencia: Heart, artefacto: Package };

  interface Result {
    id: string;
    title: string;
    sub: string;
    snippet: string;
    kind: 'respuesta' | 'carta';
    node: KnowledgeNode;
    score: number;
  }

  /** Divide un texto en trozos y marca los que coinciden con lo buscado, para resaltarlos. */
  function marks(text: string) {
    const q = app.searchQuery.trim().toLowerCase();
    if (!q) return [{ text, hit: false }];
    const out: { text: string; hit: boolean }[] = [];
    let rest = text;
    while (rest) {
      const at = rest.toLowerCase().indexOf(q);
      if (at < 0) {
        out.push({ text: rest, hit: false });
        break;
      }
      if (at > 0) out.push({ text: rest.slice(0, at), hit: false });
      out.push({ text: rest.slice(at, at + q.length), hit: true });
      rest = rest.slice(at + q.length);
    }
    return out;
  }

  function excerpt(text: string, q: string) {
    if (!q) return text.slice(0, 110) + (text.length > 110 ? '…' : '');
    const at = text.toLowerCase().indexOf(q);
    if (at < 0) return text.slice(0, 110) + (text.length > 110 ? '…' : '');
    const start = Math.max(0, at - 42);
    const end = Math.min(text.length, at + q.length + 72);
    return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
  }

  function scoreOf(text: string, q: string) {
    if (!q) return 0;
    const t = text.toLowerCase();
    if (t.startsWith(q)) return 3;
    if (t.includes(q)) return 2;
    return 0;
  }

  const source = $derived(app.searchScope === 'todas' ? allNodesEverywhere() : allNodes());
  const species = $derived(speciesList(app.searchScope === 'todas'));

  function sessionTitle(node: KnowledgeNode): string {
    return app.sessions.find((s) => s.branches.some((b) => b.nodes.some((n) => n.id === node.id)))?.title ?? '';
  }
  const allResults = $derived.by(() => {
    const q = app.searchQuery.trim().toLowerCase();
    const out: Result[] = [];

    for (const n of source) {
      if (speciesFilter && n.species !== speciesFilter) continue;
      if (typeFilter || onlyUnconfirmed) {
        const ok = n.cards.some(
          (c) =>
            (!typeFilter || c.type === typeFilter) &&
            (!onlyUnconfirmed || (c.type === 'supuesto' && c.state === 'sin_confirmar'))
        );
        if (!ok) continue;
      }
      const haystack = `${n.title} ${n.prompt} ${n.esencia} ${n.species} ${n.date}`;
      if (q && !haystack.toLowerCase().includes(q)) continue;
      out.push({
        id: n.id,
        title: n.title,
        // El jardín solo se muestra al buscar en todos; en uno solo se repetiría en cada fila.
        sub: app.searchScope === 'todas' ? `${n.species} · ${n.date} · ${sessionTitle(n)}` : `${n.species} · ${n.date}`,
        snippet: excerpt(`${n.prompt} ${n.esencia}`.trim(), q),
        kind: 'respuesta',
        node: n,
        score: scoreOf(n.title, q) + 1
      });
    }

    for (const n of source) {
      for (const c of n.cards) {
        if (typeFilter && c.type !== typeFilter) continue;
        if (onlyUnconfirmed && !(c.type === 'supuesto' && c.state === 'sin_confirmar')) continue;
        if (speciesFilter && n.species !== speciesFilter) continue;
        if (!q && !typeFilter && !onlyUnconfirmed) continue;
        if (q && !`${c.text} ${c.type} ${n.date}`.toLowerCase().includes(q)) continue;
        out.push({
          id: c.id,
          title: c.text,
          sub: `${typeName[c.type]} · ${scopeLabel[c.scope]} · ${n.date} · ${n.species}`,
          snippet: c.text.length > 80 ? excerpt(c.text, q) : `En: ${n.title}`,
          kind: 'carta',
          node: n,
          score: scoreOf(c.text, q)
        });
      }
    }

    return out.sort((a, b) => b.score - a.score || b.node.date.localeCompare(a.node.date));
  });
  const results = $derived(allResults.slice(0, 20));
  const total = $derived(allResults.length);

  function pick(r: Result) {
    openNode(r.node.id);
    app.searchOpen = false;
  }

  function close() {
    app.searchOpen = false;
  }
</script>

{#if app.searchOpen}
  <div class="overlay">
    <button class="scrim" aria-label="Cerrar búsqueda" onclick={close}></button>
    <div class="modal search-modal" role="dialog" aria-modal="true" aria-label="Buscar" tabindex="-1" use:focusTrap>
      <div class="search-head">
        <label class="search-field">
          <Search size={18} />
          <span class="sr-only">Buscar</span>
          <input
            id="search-input"
            class="modal-input"
            placeholder="Buscar planta, tema o nota"
            bind:value={app.searchQuery}
            onkeydown={(e: KeyboardEvent) => {
              if (e.key === 'Escape') close();
              if (e.key === 'Enter' && results.length) pick(results[0]);
            }}
          />
        </label>
        <button class="icon-btn" aria-label="Cerrar búsqueda" onclick={close}>
          <X size={18} />
        </button>
      </div>

      <div class="search-scope">
        <div class="seg" role="group" aria-label="Alcance de la búsqueda">
          <button class:on={app.searchScope === 'sesion'} onclick={() => (app.searchScope = 'sesion')}>
            Este jardín
          </button>
          <button class:on={app.searchScope === 'todas'} onclick={() => (app.searchScope = 'todas')}>
            Todos los jardines
          </button>
        </div>
        <span class="search-count" aria-live="polite">{total} coincidencias · mostrando {results.length}</span>
      </div>

      <div class="facets">
        {#each types as t (t.id)}
          {@const TIcon = typeIcons[t.id]}
          <button
            class="facet"
            class:on={typeFilter === t.id}
            onclick={() => (typeFilter = typeFilter === t.id ? null : t.id)}
          >
            <TIcon size={12} />
            {t.label}
          </button>
        {/each}
        <button
          class="facet"
          class:on={onlyUnconfirmed}
          onclick={() => (onlyUnconfirmed = !onlyUnconfirmed)}
        >
          <CircleQuestionMark size={12} />
          Sin confirmar
        </button>
        <select
          class="facet-select"
          value={speciesFilter ?? ''}
          onchange={(e: Event) => {
            const v = (e.currentTarget as HTMLSelectElement).value;
            speciesFilter = v || null;
          }}
          aria-label="Filtrar por especie"
        >
          <option value="">Todas las especies</option>
          {#each species as s (s)}
            <option value={s}>{s}</option>
          {/each}
        </select>
      </div>

      <div class="results">
        {#if results.length === 0}
          <div class="results-empty">
            <Search size={22} />
            <p>No hay resultados. Prueba con menos filtros.</p>
          </div>
        {:else}
          {#each results as r (r.kind + r.id)}
            <button class="result" onclick={() => pick(r)}>
              <span class="t">{#each marks(r.title) as m, i (i)}{#if m.hit}<mark>{m.text}</mark>{:else}{m.text}{/if}{/each}</span>
              <span class="s">{r.sub}</span>
              <span class="snip">{#each marks(r.snippet) as m, i (i)}{#if m.hit}<mark>{m.text}</mark>{:else}{m.text}{/if}{/each}</span>
              <span class="kind" class:carta={r.kind === 'carta'}>
                {#if r.kind === 'respuesta'}<FileText size={10} />{:else}<StickyNote size={10} />{/if}
                {r.kind === 'carta' ? 'Nota' : 'Respuesta'}
              </span>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}
