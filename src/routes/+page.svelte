<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronRight, GitBranch, Leaf, Menu, ScrollText, Search } from '@lucide/svelte';
  import Buscador from '#lib/components/Buscador.svelte';
  import Herbario from '#lib/components/Herbario.svelte';
  import Invernadero from '#lib/components/Invernadero.svelte';
  import Libro from '#lib/components/Libro.svelte';
  import Mapa from '#lib/components/Mapa.svelte';
  import { hydrateAppState, saveAppState, serializeAppState } from '#lib/persistence';
  import {
    activeBranch,
    activeNode,
    allNodes,
    app,
    loadStressCase,
    newConsultation,
    openLedger,
    openMap,
    openNode,
    openSearch,
    stopGeneration,
    toast
  } from '#lib/store.svelte';

  const branch = $derived(activeBranch());
  const node = $derived(activeNode());
  // Respuestas anteriores de la actual, de la más antigua a la más cercana, para las migas de pan.
  const ancestors = $derived.by(() => {
    const out = [];
    let parent = allNodes().find((n) => n.id === node?.parentId);
    while (parent) {
      out.unshift(parent);
      parent = allNodes().find((n) => n.id === parent?.parentId);
    }
    return out;
  });
  let hydrated = $state(false);
  let quotaWarned = false;

  onMount(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('estres') === '1') {
      loadStressCase();
      hydrated = true;
      return;
    }
    hydrateAppState();
    hydrated = true;
  });

  $effect(() => {
    if (!hydrated || app.stress || typeof localStorage === 'undefined') return;
    const serialized = serializeAppState();
    const timer = setTimeout(() => {
      if (!saveAppState(serialized) && !quotaWarned) {
        quotaWarned = true;
        toast('Almacenamiento lleno: exporta o limpia jardines antiguos');
      }
    }, 250);
    return () => clearTimeout(timer);
  });

  function typing(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    return (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    );
  }

  function move(dir: -1 | 1) {
    if (!branch || !node) return;
    const list = branch.nodes;
    const index = list.findIndex((n) => n.id === node.id);
    const next = list[index + dir];
    if (next) openNode(next.id);
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (app.mapOpen) app.mapOpen = false;
      else if (app.ledgerOpen) app.ledgerOpen = false;
      else if (app.searchOpen) app.searchOpen = false;
      else if (app.leftOpen) app.leftOpen = false;
      else if (app.rightOpen) app.rightOpen = false;
      return;
    }
    if (typing(event.target)) return;
    if (event.key === '/') {
      event.preventDefault();
      openSearch();
    } else if (event.key.toLowerCase() === 'm') {
      openMap();
    } else if (event.key.toLowerCase() === 'l') {
      openLedger('sesion');
    } else if (event.key.toLowerCase() === 'n') {
      newConsultation();
    } else if (event.key === '[') {
      move(-1);
    } else if (event.key === ']') {
      move(1);
    } else if (event.ctrlKey && event.key === '.') {
      stopGeneration();
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="app-shell">
  <header class="topbar">
    <button
      class="icon-btn only-mobile"
      aria-label="Abrir respuestas"
      onclick={() => (app.leftOpen = !app.leftOpen)}
    ><Menu size={19} /></button>
    <div class="brand">
      <span class="brand-mark" aria-hidden="true"><Leaf size={19} /></span>
      <span>
        <strong>Herbario</strong>
        <small>{app.stress ? 'estrés · 200 respuestas' : 'asistente botánico'}</small>
      </span>
    </div>
    <nav class="crumbs" aria-label="Dónde estás">
      {#if branch}<span>{branch.name}</span>{/if}
      {#each ancestors as a (a.id)}
        <span class="sep"><ChevronRight size={13} /></span>
        <button class="crumb-link" title={a.title} onclick={() => openNode(a.id)}>{a.title}</button>
      {/each}
      {#if node}<span class="sep"><ChevronRight size={13} /></span><strong>{node.title}</strong>{/if}
    </nav>
    <div class="top-actions">
      <button class="btn ghost" onclick={openSearch} aria-label="Buscar (tecla /)">
        <Search size={15} /><span class="btn-label">Buscar</span><kbd>/</kbd>
      </button>
      <button class="btn ghost desktop-only" onclick={() => openLedger('sesion')}>
        <ScrollText size={15} /><span class="btn-label">Historial</span><kbd>L</kbd>
      </button>
      <button class="btn ghost desktop-only" onclick={openMap}>
        <GitBranch size={15} /><span class="btn-label">Árbol</span><kbd>M</kbd>
      </button>
    </div>
  </header>

  {#if app.leftOpen}
    <button class="drawer-scrim only-mobile" aria-label="Cerrar respuestas" onclick={() => (app.leftOpen = false)}></button>
  {/if}

  <main class="layout">
    <Herbario />
    <section class="center">
      <Invernadero />
    </section>
  </main>
</div>

<Buscador />
<Mapa />
<Libro />

{#if app.toast}
  <div class="toast" role="status"><Leaf size={15} /><span>{app.toast}</span></div>
{/if}
