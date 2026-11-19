<script lang="ts">
  import {
    ArrowUpRight,
    ChevronDown,
    ChevronRight,
    ChevronsDownUp,
    ChevronsUpDown,
    FlaskConical,
    GitBranch,
    GitFork,
    Info,
    Library,
    ListChecks,
    LocateFixed,
    MessagesSquare,
    Route,
    ScanEye,
    Search,
    Sprout,
    X
  } from '@lucide/svelte';
  import type { KnowledgeNode } from '#lib/types';
  import { SvelteSet } from 'svelte/reactivity';
  import { slide } from 'svelte/transition';
  import { app, loadTreeDemo, openNode } from '#lib/store.svelte';
  import { focusTrap } from '#lib/focus';

  let query = $state('');
  let bodyEl: HTMLDivElement | undefined = $state();
  let previewId = $state<string | null>(null);
  let rootLimit = $state(40);
  const collapsed = new SvelteSet<string>();

  const nodes = $derived(app.session.branches.flatMap((b) => b.nodes));
  const byId = $derived(new Map(nodes.map((n) => [n.id, n])));

  const byParent = $derived.by(() => {
    const map = new Map<string, KnowledgeNode[]>();
    for (const n of nodes) {
      if (!n.parentId || !byId.has(n.parentId)) continue;
      const list = map.get(n.parentId) ?? [];
      list.push(n);
      map.set(n.parentId, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.date.localeCompare(b.date));
    return map;
  });

  const roots = $derived.by(() => {
    const list = nodes.filter((n) => !n.parentId || !byId.has(n.parentId));
    return list.sort((a, b) => b.date.localeCompare(a.date));
  });

  const q = $derived(query.trim().toLowerCase());

  const matches = $derived(
    q
      ? nodes.filter((n) =>
          `${n.title} ${n.species} ${n.prompt} ${n.esencia}`.toLowerCase().includes(q)
        )
      : []
  );
  const matchIds = $derived(new Set(matches.map((n) => n.id)));

  /** Coincidencias + sus ancestros + sus descendientes. Null = sin filtro. */
  const visibleIds = $derived.by(() => {
    if (!q) return null;
    const visible = new Set<string>();
    const walked = new Set<string>();
    for (const n of matches) {
      visible.add(n.id);
      let parent = n.parentId;
      while (parent && !walked.has(parent)) {
        walked.add(parent);
        visible.add(parent);
        parent = byId.get(parent)?.parentId;
      }
    }
    const walkedDown = new Set<string>();
    const addDescendants = (id: string) => {
      if (walkedDown.has(id)) return;
      walkedDown.add(id);
      for (const kid of byParent.get(id) ?? []) {
        visible.add(kid.id);
        addDescendants(kid.id);
      }
    };
    for (const n of matches) addDescendants(n.id);
    return visible;
  });

  const visibleRoots = $derived(
    visibleIds ? roots.filter((n) => visibleIds.has(n.id)) : roots
  );
  const pagedRoots = $derived(q ? visibleRoots : visibleRoots.slice(0, rootLimit));

  const pathIds = $derived.by(() => {
    const path = new Set<string>();
    let id = byId.get(app.activeNodeId)?.parentId;
    while (id && !path.has(id)) {
      path.add(id);
      id = byId.get(id)?.parentId;
    }
    return path;
  });

  const forks = $derived([...byParent.values()].filter((kids) => kids.length > 1).length);
  const stressHint = $derived(nodes.length > 40 && roots.length === nodes.length);

  const maxDepth = $derived.by(() => {
    const seen = new Set<string>();
    const walk = (n: KnowledgeNode, depth: number): number => {
      if (seen.has(n.id)) return depth;
      seen.add(n.id);
      let deepest = depth;
      for (const kid of byParent.get(n.id) ?? []) {
        deepest = Math.max(deepest, walk(kid, depth + 1));
      }
      return deepest;
    };
    return roots.reduce((deepest, root) => Math.max(deepest, walk(root, 1)), 0);
  });

  const treeStats = $derived([
    { icon: MessagesSquare, value: nodes.length, label: 'respuestas' },
    { icon: Sprout, value: roots.length, label: roots.length === 1 ? 'conversación' : 'conversaciones' },
    { icon: GitFork, value: forks, label: forks === 1 ? 'continuación' : 'continuaciones' },
    { icon: Route, value: maxDepth, label: maxDepth === 1 ? 'nivel' : 'niveles' }
  ]);

  const depthTones = [
    { tone: 'var(--moss)', soft: 'var(--moss-soft)' },
    { tone: 'var(--olive)', soft: 'var(--olive-soft)' },
    { tone: 'var(--ochre)', soft: 'var(--ochre-soft)' },
    { tone: 'var(--plum)', soft: 'var(--plum-soft)' }
  ];

  const preview = $derived(byId.get(previewId ?? '') ?? byId.get(app.activeNodeId) ?? roots[0]);

  const previewLineage = $derived.by(() => {
    const line: KnowledgeNode[] = [];
    if (!preview) return line;
    const seen = new Set<string>();
    let id = preview.parentId;
    while (id && !seen.has(id)) {
      seen.add(id);
      const node = byId.get(id);
      if (!node) break;
      line.unshift(node);
      id = node.parentId;
    }
    return line;
  });

  const previewDepth = $derived(previewLineage.length + 1);

  $effect(() => {
    if (!app.mapOpen) return;
    previewId = app.activeNodeId || null;
  });

  $effect(() => {
    if (!app.mapOpen || !app.activeNodeId) return;
    const frame = requestAnimationFrame(() => scrollCurrent());
    return () => cancelAnimationFrame(frame);
  });

  function scrollCurrent(behavior: ScrollBehavior = 'smooth') {
    if (!bodyEl) return;
    const current = bodyEl.querySelector<HTMLElement>('.tree-item.current');
    if (!current) return;
    const top =
      current.getBoundingClientRect().top -
      bodyEl.getBoundingClientRect().top +
      bodyEl.scrollTop;
    bodyEl.scrollTo({
      top: Math.max(0, top - bodyEl.clientHeight / 2 + current.offsetHeight / 2),
      behavior
    });
  }

  function revealCurrent() {
    if (!app.activeNodeId) return;
    let id = byId.get(app.activeNodeId)?.parentId;
    while (id) {
      collapsed.delete(id);
      id = byId.get(id)?.parentId;
    }
    requestAnimationFrame(() => scrollCurrent());
  }

  function close() {
    app.mapOpen = false;
  }

  function go(id: string) {
    openNode(id);
    close();
  }

  function goPreview() {
    if (preview) go(preview.id);
  }

  function toggle(id: string) {
    if (collapsed.has(id)) collapsed.delete(id);
    else collapsed.add(id);
  }

  function expandAll() {
    collapsed.clear();
  }

  function collapseAll() {
    collapsed.clear();
    for (const id of byParent.keys()) collapsed.add(id);
  }

  function loadExample() {
    query = '';
    collapsed.clear();
    loadTreeDemo();
  }

  function shortDate(date: string) {
    return date.slice(5).replace('-', '/');
  }

  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function longDate(date: string) {
    const [year, month, day] = date.split('-');
    return `${Number(day)} ${months[Number(month) - 1] ?? ''} ${year}`;
  }
</script>

{#snippet treeRow(n: KnowledgeNode, depth: number)}
  {@const kids = byParent.get(n.id) ?? []}
  {@const shownKids = visibleIds ? kids.filter((kid) => visibleIds.has(kid.id)) : kids}
  {@const parent = n.parentId ? byId.get(n.parentId) : undefined}
  {@const open = q ? true : !collapsed.has(n.id)}
  {@const tone = depthTones[depth % depthTones.length]}
  <li
    class="tree-item"
    class:on-path={pathIds.has(n.id)}
    class:current={app.activeNodeId === n.id}
    class:match={matchIds.has(n.id)}
    style="--tone: {tone.tone}; --tone-soft: {tone.soft};"
  >
    <div class="tree-row">
      {#if kids.length}
        <button
          type="button"
          class="tree-toggle"
          aria-expanded={open}
          aria-controls={`tree-kids-${n.id}`}
          aria-label={open ? `Contraer ${n.title}` : `Expandir ${n.title}`}
          onclick={() => toggle(n.id)}
        >
          {#if open}<ChevronDown size={14} />{:else}<ChevronRight size={14} />{/if}
        </button>
      {:else}
        <span class="tree-dot" aria-hidden="true"></span>
      {/if}
      <button
        type="button"
        class="tree-card"
        aria-current={app.activeNodeId === n.id ? 'page' : undefined}
        onmouseenter={() => (previewId = n.id)}
        onfocus={() => (previewId = n.id)}
        onclick={() => go(n.id)}
      >
        <span class="tree-title">{n.title}</span>
        <span class="tree-meta">
          <span class="tree-date">{shortDate(n.date)}</span>
          {#if !parent || parent.species !== n.species}<span class="tree-species">{n.species}</span>{/if}
          {#if n.status !== 'lista'}<span class="status {n.status}">{n.status}</span>{/if}
          {#if kids.length > 1}
            <span class="tree-forks"><GitFork size={10} />{kids.length}</span>
          {/if}
        </span>
        <span class="tree-go" aria-hidden="true"><ArrowUpRight size={14} /></span>
      </button>
    </div>
    {#if open && shownKids.length}
      <ul class="tree-children" id={`tree-kids-${n.id}`} transition:slide={{ duration: 160 }}>
        {#each shownKids as kid (kid.id)}
          {@render treeRow(kid, depth + 1)}
        {/each}
      </ul>
    {/if}
  </li>
{/snippet}

{#if app.mapOpen}
  <div class="overlay map-overlay">
    <button class="scrim" aria-label="Cerrar árbol" onclick={close}></button>
    <div
      class="modal map-modal tree-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tree-title"
      tabindex="-1"
      use:focusTrap
    >
      <header class="modal-head tree-head">
        <span class="modal-icon" aria-hidden="true"><GitBranch size={18} /></span>
        <div class="modal-head-titles">
          <p class="eyebrow">
            {nodes.length} respuestas · {roots.length} {roots.length === 1 ? 'conversación' : 'conversaciones'}{#if q} · {matches.length} coincidencias{/if}
          </p>
          <h2 id="tree-title">Árbol de respuestas</h2>
          <p class="tree-subtitle">Cada continuación sale de una respuesta anterior. Puedes volver a cualquiera.</p>
        </div>
        <button class="icon-btn" aria-label="Cerrar árbol" onclick={close}><X size={18} /></button>
      </header>

      <div class="tree-tools">
        <label class="sr-only" for="tree-filter">Buscar en el árbol</label>
        <span class="tree-search">
          <Search size={15} aria-hidden="true" />
          <input
            id="tree-filter"
            bind:value={query}
            placeholder="Buscar por planta, tema o esencia…"
          />
        </span>
        <div class="tree-actions">
          {#if app.activeNodeId}
            <button
              class="btn tiny"
              onclick={revealCurrent}
              title="Centrar en la respuesta actual"
              aria-label="Centrar en la respuesta actual"
            >
              <LocateFixed size={13} /><span class="btn-label">Centrar</span>
            </button>
          {/if}
          <button
            class="btn tiny ghost tree-example"
            onclick={loadExample}
            title="Cargar árbol de ejemplo"
            aria-label="Cargar árbol de ejemplo"
          >
            <FlaskConical size={13} /><span class="btn-label">Ejemplo</span>
          </button>
          <button class="btn tiny ghost" onclick={expandAll} title="Expandir todo" aria-label="Expandir todo">
            <ChevronsUpDown size={13} /><span class="btn-label">Expandir</span>
          </button>
          <button class="btn tiny ghost" onclick={collapseAll} title="Contraer todo" aria-label="Contraer todo">
            <ChevronsDownUp size={13} /><span class="btn-label">Contraer</span>
          </button>
        </div>
      </div>

      <div class="tree-stats" aria-label="Resumen de las conversaciones">
        {#each treeStats as stat, i}
          {@const StatIcon = stat.icon}
          <div class="tree-stat" data-stat={i}>
            <StatIcon size={17} aria-hidden="true" />
            <div><strong>{stat.value}</strong><span>{stat.label}</span></div>
          </div>
        {/each}
      </div>

      <div class="tree-main">
        <div class="tree-body" bind:this={bodyEl}>
          {#if stressHint}
            <div class="tree-hint">
              <Info size={16} />
              <span>Todavía no hay conversaciones. Carga el ejemplo para ver cómo se ven.</span>
              <button class="btn tiny" onclick={loadExample}>Cargar ejemplo</button>
            </div>
          {/if}

          {#if q && !matches.length}
            <p class="tree-empty">No hay respuestas que coincidan con «{query.trim()}».</p>
          {:else if !roots.length}
            <p class="tree-empty">Todavía no hay respuestas en este jardín.</p>
          {:else}
            <ul class="tree-list" aria-label="Conversaciones y sus respuestas">
              {#each pagedRoots as root (root.id)}
                {@render treeRow(root, 1)}
              {/each}
            </ul>
            {#if !q && visibleRoots.length > pagedRoots.length}
              <button class="more-btn" onclick={() => (rootLimit += 40)}>
                Mostrar 40 raíces más · quedan {visibleRoots.length - pagedRoots.length}
              </button>
            {/if}
          {/if}
        </div>

        <aside class="tree-preview" aria-label="Vista previa de la respuesta">
          {#if preview}
            {@const previewKids = byParent.get(preview.id)?.length ?? 0}
            <div class="preview-head">
              <p class="eyebrow"><ScanEye size={12} /> Vista previa</p>
              <span class="preview-level">Nivel {previewDepth}</span>
            </div>
            <div class="preview-lineage">
              {#if previewLineage.length}
                {#each previewLineage.slice(-3) as ancestor (ancestor.id)}
                  <span>{ancestor.title}</span>
                  <ChevronRight size={10} />
                {/each}
              {:else}
                <span>Inicio de la conversación</span>
              {/if}
            </div>
            <h3 class="preview-title">{preview.title}</h3>
            <p class="preview-sub">{preview.species} · {longDate(preview.date)}</p>
            <div class="preview-status"><span class="status {preview.status}">{preview.status}</span></div>
            {#if preview.prompt}
              <blockquote class="preview-quote">
                <span>Lo que preguntaste</span>{preview.prompt}
              </blockquote>
            {/if}
            <p class="preview-essence">{preview.esencia}</p>
            <div class="preview-facts">
              <span><ListChecks size={11} />{preview.actions.length} pasos</span>
              <span><GitFork size={11} />{previewKids} {previewKids === 1 ? 'continuación' : 'continuaciones'}</span>
              <span><Library size={11} />{preview.cards.length} datos</span>
            </div>
            <button class="btn primary preview-open" onclick={goPreview}>
              Abrir esta respuesta
              <ArrowUpRight size={14} />
            </button>
          {:else}
            <div class="preview-empty">
              <ScanEye size={26} />
              <p>Pasa el cursor por una respuesta para ver su contexto.</p>
            </div>
          {/if}
        </aside>
      </div>

      <footer class="modal-foot">
        <span>Haz clic en una respuesta para abrirla.</span>
      </footer>
    </div>
  </div>
{/if}
