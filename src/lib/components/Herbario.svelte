<script lang="ts">
  import { Clock3, Leaf, MessagesSquare, Pin, Plus, Search } from '@lucide/svelte';
  import type { KnowledgeNode } from '#lib/types';
  import {
    activeNode,
    allNodes,
    app,
    lineCount,
    newConsultation,
    openNode,
    switchSession
  } from '#lib/store.svelte';

  let query = $state('');
  let tab = $state<'recientes' | 'plantas' | 'fijadas'>('recientes');
  let shown = $state(30);

  const nodes = $derived(allNodes());
  const current = $derived(activeNode());
  const pending = (n: KnowledgeNode) =>
    n.cards.filter((c) => c.type === 'supuesto' && c.state === 'sin_confirmar').length;
  const totalPending = $derived(nodes.reduce((sum, n) => sum + pending(n), 0));
  const sorted = $derived(
    [...nodes]
      .filter((n) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return `${n.title} ${n.species} ${n.prompt} ${n.esencia}`.toLowerCase().includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  );
  const pinned = $derived(sorted.filter((n) => n.pinned));
  const recent = $derived(sorted.slice(0, shown));
  const groups = $derived(
    app.session.branches
      .map((b) => {
        const items = sorted.filter((n) => n.branchId === b.id);
        return { branch: b, total: items.length, items: items.slice(0, 8) };
      })
      .filter((g) => g.total)
  );

  function shortDate(date: string) {
    return date.slice(5).replace('-', '/');
  }

  function pick(id: string) {
    openNode(id);
    app.leftOpen = false;
  }

  function snippet(n: KnowledgeNode) {
    return n.esencia.length > 96 ? `${n.esencia.slice(0, 96)}…` : n.esencia;
  }
</script>

<aside class="panel-left" class:open={app.leftOpen} aria-label="Respuestas">
  <div class="panel-head">
    <div>
      <p class="eyebrow">Tu jardín</p>
      <h2>Respuestas</h2>
    </div>
    <button class="btn tiny" onclick={newConsultation}><Plus size={13} /> Nueva</button>
  </div>

  <label class="mem-search">
    <span class="sr-only">Buscar en respuestas</span>
    <Search size={15} aria-hidden="true" />
    <input bind:value={query} placeholder="Buscar planta, tema o nota" />
  </label>

  <div class="mem-tabs" role="tablist" aria-label="Ordenar respuestas">
    <button role="tab" aria-selected={tab === 'recientes'} class:active={tab === 'recientes'} onclick={() => (tab = 'recientes')}><Clock3 size={12} /> Recientes</button>
    <button role="tab" aria-selected={tab === 'plantas'} class:active={tab === 'plantas'} onclick={() => (tab = 'plantas')}><Leaf size={12} /> Por planta</button>
    <button role="tab" aria-selected={tab === 'fijadas'} class:active={tab === 'fijadas'} onclick={() => (tab = 'fijadas')}><Pin size={12} /> Fijadas</button>
  </div>

  <div class="memory-list">
    {#if tab === 'recientes'}
      {#each recent as n (n.id)}
        <button class="mem-row" class:active={current?.id === n.id} aria-current={current?.id === n.id ? 'page' : undefined} onclick={() => pick(n.id)}>
          <span class="mem-title">{#if n.pinned}<Pin size={11} class="pin-inline" aria-label="Fijada" />{/if}{n.title}</span>
          <span class="mem-meta">
            {n.species} · {shortDate(n.date)}
            {#if pending(n)}<span class="pending">{pending(n)} por confirmar</span>{/if}
            {#if lineCount(n) > 1}<span class="lines">{lineCount(n)} continuaciones</span>{/if}
          </span>
          <span class="mem-snippet">{snippet(n)}</span>
        </button>
      {:else}
        <p class="panel-note">No hay respuestas que coincidan.</p>
      {/each}
      {#if sorted.length > shown}
        <button class="more-mem" onclick={() => (shown += 30)}>Mostrar 30 más · quedan {sorted.length - shown}</button>
      {/if}
    {:else if tab === 'plantas'}
      {#each groups as group (group.branch.id)}
        <section class="mem-group">
          <h3>{group.branch.name}<span>{group.total}</span></h3>
          {#each group.items as n (n.id)}
            <button class="mem-row compact" class:active={current?.id === n.id} aria-current={current?.id === n.id ? 'page' : undefined} onclick={() => pick(n.id)}>
              <span class="mem-title">{n.title}</span>
              <span class="mem-meta">
                {shortDate(n.date)}
                {#if pending(n)}<span class="pending">{pending(n)} por confirmar</span>{/if}
                {#if lineCount(n) > 1}<span class="lines">{lineCount(n)} continuaciones</span>{/if}
              </span>
            </button>
          {/each}
          {#if group.total > group.items.length}
            <p class="panel-note group-more">+{group.total - group.items.length} más · usa Buscar</p>
          {/if}
        </section>
      {:else}
        <p class="panel-note">Aún no hay plantas agrupadas.</p>
      {/each}
    {:else}
      {#each pinned as n (n.id)}
        <button class="mem-row" class:active={current?.id === n.id} aria-current={current?.id === n.id ? 'page' : undefined} onclick={() => pick(n.id)}>
          <span class="mem-title">
            {#if n.pinned}<Pin size={11} class="pin-inline" />{/if}{n.title}
          </span>
          <span class="mem-meta">
            {n.species} · {shortDate(n.date)}
            {#if lineCount(n) > 1}<span class="lines">{lineCount(n)} continuaciones</span>{/if}
          </span>
          <span class="mem-snippet">{snippet(n)}</span>
        </button>
      {:else}
        <p class="panel-note">No has fijado respuestas todavía.</p>
      {/each}
    {/if}
  </div>

  <footer class="mem-foot">
    <span><MessagesSquare size={13} /> {nodes.length} respuestas · {totalPending} {totalPending === 1 ? 'suposición pendiente' : 'suposiciones pendientes'}</span>
    <label class="session-select">
      <span class="sr-only">Jardín</span>
      <select value={app.sessionId} onchange={(e: Event) => switchSession((e.currentTarget as HTMLSelectElement).value)}>
        {#each app.sessions as s (s.id)}<option value={s.id}>{s.title}</option>{/each}
      </select>
    </label>
  </footer>
</aside>
