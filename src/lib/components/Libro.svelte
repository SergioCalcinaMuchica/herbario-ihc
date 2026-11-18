<script lang="ts">
  import type { Card, CardType } from '#lib/types';
  import { app, activeNode, allNodes, briefSummary, inheritedCards, openNode, ownCards, unconfirmed } from '#lib/store.svelte';
  import { focusTrap } from '#lib/focus';
  import Carta from './Carta.svelte';
  import {
    ArrowUpRight,
    FileText,
    GitFork,
    Lightbulb,
    MessagesSquare,
    ScrollText,
    Sparkles,
    UserRound,
    X
  } from '@lucide/svelte';

  let sessionQuery = $state('');
  let branchFilter = $state('');
  let archiveScope = $state<'heredadas' | 'propias' | 'todas'>('heredadas');
  let archiveType = $state<CardType | null>(null);
  let archiveQuery = $state('');

  const node = $derived(activeNode());
  const own = $derived(ownCards(node));
  const inherited = $derived(inheritedCards(node));
  const activeScopedCount = $derived(
    inherited.filter((c) => c.scope === 'global' || c.scope === 'especie').length
  );
  const archivePool = $derived<Card[]>(
    archiveScope === 'propias' ? own : archiveScope === 'heredadas' ? inherited : [...own, ...inherited]
  );
  const archiveFiltered = $derived.by(() => {
    const q = archiveQuery.trim().toLowerCase();
    return archivePool.filter((c) => {
      if (archiveType && c.type !== archiveType) return false;
      if (q && !`${c.text} ${c.type} ${c.scope}`.toLowerCase().includes(q)) return false;
      return true;
    });
  });
  const archiveShown = $derived(archiveFiltered.slice(0, app.ledgerLimit));
  const archiveScopes: { id: 'heredadas' | 'propias' | 'todas'; label: string }[] = [
    { id: 'heredadas', label: 'De otras respuestas' },
    { id: 'propias', label: 'De esta respuesta' },
    { id: 'todas', label: 'Todo' }
  ];
  const archiveTypes: { id: CardType; label: string }[] = [
    { id: 'hecho', label: 'Datos' },
    { id: 'supuesto', label: 'Suposiciones' },
    { id: 'preferencia', label: 'Preferencias' },
    { id: 'artefacto', label: 'Materiales' }
  ];
  const assumptions = $derived(
    node?.cards.filter((c) => c.type === 'supuesto' && c.source !== 'usuario' && c.state !== 'ignorado') ?? []
  );
  const proposals = $derived(
    node?.cards.filter((c) => c.source === 'ia' && c.type !== 'supuesto' && c.state !== 'ignorado') ?? []
  );
  const userCards = $derived(
    node?.cards.filter((c) => c.source === 'usuario' && c.state !== 'ignorado') ?? []
  );
  const brief = $derived(briefSummary(node?.brief));
  const typeLabel: Record<string, string> = {
    hecho: 'Dato sin fuente',
    supuesto: 'Suposición',
    preferencia: 'Preferencia',
    artefacto: 'Material'
  };

  const branches = $derived(app.session.branches);
  const tabs = [
    { id: 'lamina' as const, label: 'Esta respuesta', icon: FileText },
    { id: 'sesion' as const, label: 'Este jardín', icon: MessagesSquare },
    { id: 'heredado' as const, label: 'Heredado', icon: GitFork }
  ];
  const sessionNodes = $derived(
    allNodes()
      .filter((n) => {
        if (branchFilter && n.branchId !== branchFilter) return false;
        const q = sessionQuery.trim().toLowerCase();
        if (!q) return true;
        return `${n.title} ${n.prompt} ${n.esencia} ${n.species}`.toLowerCase().includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  );
  const shownNodes = $derived(sessionNodes.slice(0, app.ledgerLimit));

  function setTab(tab: 'lamina' | 'sesion' | 'heredado') {
    app.ledgerTab = tab;
    app.ledgerLimit = 30;
  }

  function close() {
    app.ledgerOpen = false;
  }

  function go(id: string) {
    openNode(id);
    close();
  }

  const statusLabel: Record<string, string> = {
    lista: 'lista',
    borrador: 'borrador',
    generando: 'generando',
    desactualizada: 'desactualizada'
  };
</script>

{#if app.ledgerOpen}
  <div class="overlay">
    <button class="scrim" aria-label="Cerrar libro de campo" onclick={close}></button>
    <div
      class="modal ledger"
      role="dialog"
      aria-modal="true"
      aria-label="Libro de campo"
      tabindex="-1"
      use:focusTrap
    >
      <header class="ledger-head">
        <span class="modal-icon"><ScrollText size={17} /></span>
        <div>
          <h2>Historial</h2>
          <p>{app.session.title} · {allNodes().length} respuestas · registro, no chat</p>
        </div>
        <button class="icon-btn" aria-label="Cerrar historial" onclick={close}><X size={18} /></button>
      </header>

      <div class="facets">
        {#each tabs as t (t.id)}
          {@const TabIcon = t.icon}
          <button
            class="facet"
            class:on={app.ledgerTab === t.id}
            onclick={() => setTab(t.id)}
          >
            <TabIcon size={12} />
            {t.label}
          </button>
        {/each}
      </div>

      {#if app.ledgerTab === 'lamina'}
        {#if !node}
          <div class="results-empty">Abre una respuesta para ver sus tres voces.</div>
        {:else}
          <div class="ledger-body">
            <section class="voice user">
              <h3><UserRound size={15} /> Tú dijiste</h3>
              <p class="quote">«{node.prompt}»</p>
              <p class="voice-meta">{node.date} · hilo {branches.find((b) => b.id === node.branchId)?.name ?? '—'}</p>
              {#if brief.length}
                <div class="facts">
                  {#each brief as f (f)}<span class="fact">{f}</span>{/each}
                </div>
              {/if}
              {#if userCards.length}
                <div class="ledger-cards">
                  {#each userCards as c (c.id)}<Carta card={c} compact />{/each}
                </div>
              {/if}
            </section>

            <section class="voice ai">
              <h3><Sparkles size={15} /> La IA propuso</h3>
              <p>{node.esencia}</p>
              <p class="voice-meta">
                {node.model} · {node.generatedAt} ·
                {node.actions.length} acciones · {node.params.length} parámetros ·
                {node.sections.length} secciones
              </p>
              {#if proposals.length}
                <ul class="voice-list">
                  {#each proposals as c (c.id)}
                    <li>
                      <span class="tag" class:warn={c.type === 'hecho'}>{typeLabel[c.type] ?? c.type}</span>
                      {c.text}
                    </li>
                  {/each}
                </ul>
              {/if}
              <div class="voice-actions">
                <button class="btn tiny" onclick={() => go(node.id)}>
                  Abrir respuesta
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </section>

            <section class="voice assumed">
              <h3><Lightbulb size={15} /> La IA supuso</h3>
              {#if assumptions.length === 0}
                <p class="voice-meta">No hay supuestos registrados.</p>
              {:else}
                <p class="voice-meta">
                  {unconfirmed(node).length} sin confirmar · {assumptions.length} en total
                </p>
                <div class="ledger-cards">
                  {#each assumptions as c (c.id)}
                    <Carta card={c} />
                  {/each}
                </div>
              {/if}
            </section>
          </div>
        {/if}
      {:else if app.ledgerTab === 'sesion'}
        <div class="ledger-filters">
          <input
            class="modal-input"
            placeholder="Filtrar el libro por planta, síntoma o consulta…"
            bind:value={sessionQuery}
            aria-label="Filtrar el historial del jardín"
          />
          <select bind:value={branchFilter} aria-label="Filtrar por hilo">
            <option value="">Todos los hilos</option>
            {#each branches as b (b.id)}
              <option value={b.id}>{b.name}</option>
            {/each}
          </select>
        </div>

        <div class="ledger-body">
          {#if sessionNodes.length === 0}
            <div class="results-empty">Ninguna respuesta con ese filtro.</div>
          {:else}
            {#each shownNodes as n (n.id)}
              <article class="entry">
                <header>
                  <div>
                    <strong>{n.title}</strong>
                    <span class="entry-meta">{n.date} · {branches.find((b) => b.id === n.branchId)?.name ?? '—'} · {statusLabel[n.status]}</span>
                  </div>
                  <button class="btn tiny" onclick={() => go(n.id)}>
                    Abrir
                    <ArrowUpRight size={12} />
                  </button>
                </header>
                <p class="entry-ask"><span>Tú dijiste:</span> {n.prompt}</p>
                <p class="entry-ai"><span>La IA propuso:</span> {n.esencia}</p>
                <p class="entry-sup">
                  <span>La IA supuso:</span>
                  {n.cards.filter((c) => c.type === 'supuesto').length} supuestos
                  ({n.cards.filter((c) => c.type === 'supuesto' && c.state === 'sin_confirmar').length} sin confirmar)
                </p>
              </article>
            {/each}
            {#if sessionNodes.length > shownNodes.length}
              <button class="more-btn" onclick={() => (app.ledgerLimit += 30)}>
                Mostrar 30 más · quedan {sessionNodes.length - shownNodes.length}
              </button>
            {/if}
          {/if}
        </div>
      {:else}
        {#if !node}
          <div class="ledger-body">
            <div class="results-empty">Abre una respuesta para revisar su archivo de contexto.</div>
          </div>
        {:else}
          <div class="ledger-filters">
            <input
              class="modal-input"
              placeholder="Filtrar datos, suposiciones o materiales…"
              aria-label="Filtrar el archivo de contexto"
              bind:value={archiveQuery}
              oninput={() => (app.ledgerLimit = 30)}
            />
          </div>

          <div class="facets">
            {#each archiveScopes as s (s.id)}
              <button
                class="facet"
                class:on={archiveScope === s.id}
                onclick={() => {
                  archiveScope = s.id;
                  app.ledgerLimit = 30;
                }}
              >
                {s.label}
                <span class="facet-count">
                  {s.id === 'heredadas' ? inherited.length : s.id === 'propias' ? own.length : own.length + inherited.length}
                </span>
              </button>
            {/each}
            {#each archiveTypes as t (t.id)}
              <button
                class="facet"
                class:on={archiveType === t.id}
                onclick={() => {
                  archiveType = archiveType === t.id ? null : t.id;
                  app.ledgerLimit = 30;
                }}
              >
                {t.label}
              </button>
            {/each}
          </div>

          <div class="ledger-body">
            {#if archiveFiltered.length === 0}
              <div class="results-empty">Ninguna carta con ese filtro para {node.species}.</div>
            {:else}
              <p class="voice-meta">
                Cartas de esta respuesta y heredadas de otras respuestas, filtrables por ámbito y tipo.{activeScopedCount ? ` ${activeScopedCount} reglas activas de especie/global.` : ''}
              </p>
              <div class="ledger-cards">
                {#each archiveShown as c (c.id)}
                  <Carta card={c} />
                {/each}
              </div>
              {#if archiveFiltered.length > archiveShown.length}
                <button class="more-btn" onclick={() => (app.ledgerLimit += 30)}>
                  Mostrar 30 más · quedan {archiveFiltered.length - archiveShown.length}
                </button>
              {/if}
            {/if}
          </div>
        {/if}
      {/if}

      <footer class="ledger-foot">
        <span>Confirmar o corregir versiona y marca dependientes como desactualizadas.</span>
      </footer>
    </div>
  </div>
{/if}
