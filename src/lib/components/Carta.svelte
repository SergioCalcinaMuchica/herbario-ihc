<script lang="ts">
  import {
    Check,
    ChevronDown,
    CircleQuestionMark,
    Download,
    Ellipsis,
    EyeOff,
    GitFork,
    Globe,
    Heart,
    Package,
    Pencil,
    Pin,
    PinOff,
    Trash,
    X
  } from '@lucide/svelte';
  import type { Card, Scope } from '#lib/types';
  import {
    activeNode,
    allNodesEverywhere,
    confirmCard,
    correctCard,
    editCard,
    ignoreCard,
    removeCard,
    setScope,
    togglePin,
    toast,
    scopeLabel
  } from '#lib/store.svelte';

  let { card, compact = false }: { card: Card; compact?: boolean } = $props();

  let editing = $state<false | 'edit' | 'correct'>(false);
  let draft = $state('');
  let confirmingRemove = $state(false);

  // Las tres opciones de alcance se muestran juntas, con la elegida marcada.
  const scopes: Scope[] = ['hilo', 'especie', 'global'];
  const scopeNames: Record<Scope, string> = { hilo: 'Esta conversación', especie: 'Esta planta', global: 'Siempre' };

  const labels: Record<Card['type'], string> = {
    hecho: 'Dato',
    supuesto: 'Suposición',
    preferencia: 'Preferencia',
    artefacto: 'Material'
  };
  const icons = {
    hecho: Check,
    supuesto: CircleQuestionMark,
    preferencia: Heart,
    artefacto: Package
  };
  const TypeIcon = $derived(icons[card.type]);

  const owner = $derived(allNodesEverywhere().find((n) => n.cards.some((c) => c.id === card.id)));
  const fromOther = $derived(owner && owner.id !== activeNode()?.id);

  const voice = $derived.by(() => {
    if (card.state === 'confirmado' && card.source === 'ia') return 'Tú lo confirmaste';
    if (card.state === 'corregido') return 'Corregido por ti';
    if (card.source === 'usuario') {
      return card.type === 'hecho' ? 'Tú lo dijiste' : 'Tú lo decidiste';
    }
    if (card.type === 'supuesto') return 'La IA lo supuso';
    return card.type === 'artefacto' ? 'La IA lo generó' : 'La IA lo propuso';
  });

  function begin(mode: 'edit' | 'correct') {
    draft = card.text;
    editing = mode;
  }

  function save() {
    if (editing === 'correct') correctCard(card, draft);
    else editCard(card, draft);
    editing = false;
  }

  function exportCard() {
    const md = `# ${labels[card.type]}\n\n${card.text}\n\nSe aplica a: ${scopeLabel[card.scope]}\n`;
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `carta-${card.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Nota exportada');
  }

  function pinOwner() {
    if (owner) togglePin(owner);
  }
</script>

<div class="card {card.type}" class:compact>
  <div class="card-head">
    <TypeIcon size={13} />
    <span class="tag">{labels[card.type]}</span>
    <span class="voice" class:from-user={card.source === 'usuario'}>{voice}</span>
    {#if card.type === 'supuesto' && card.confidence}
      <span class="scope">confianza {card.confidence}</span>
    {:else}
      <span class="scope">{scopeLabel[card.scope]}</span>
    {/if}
  </div>

  {#if fromOther && owner}
    <div class="source"><GitFork size={11} /> De: {owner.title}</div>
  {/if}

  <div class="text">{card.text}</div>

  {#if card.detail && (!compact || card.type === 'supuesto')}
    <div class="detail">{card.detail}</div>
  {/if}

  {#if editing}
    <input
      bind:value={draft}
      aria-label={editing === 'correct' ? 'Corregir suposición' : 'Editar dato'}
      onkeydown={(e: KeyboardEvent) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') editing = false;
      }}
    />
    <div class="actions">
      <button class="btn tiny primary" onclick={save}><Check size={12} /> Guardar</button>
      <button class="btn tiny ghost" onclick={() => (editing = false)}><X size={12} /> Cancelar</button>
    </div>
  {:else if !compact}
    <div class="actions">
      {#if card.type === 'hecho'}
        <button class="btn tiny" onclick={() => begin('edit')}><Pencil size={12} /> Editar</button>
        {#if confirmingRemove}
          <span class="confirm-text">¿Quitar este dato?</span>
          <button class="btn tiny" onclick={() => removeCard(card)}><Trash size={12} /> Sí, quitar</button>
          <button class="btn tiny ghost" onclick={() => (confirmingRemove = false)}>No</button>
        {:else}
          <button class="btn tiny ghost" onclick={() => (confirmingRemove = true)}><Trash size={12} /> Quitar</button>
        {/if}
      {:else if card.type === 'supuesto'}
        {#if card.state === 'sin_confirmar'}
          <button class="btn tiny" onclick={() => confirmCard(card)}><Check size={12} /> Confirmar</button>
        {/if}
        <details class="more">
          <summary class="btn tiny ghost more-toggle">
            <Ellipsis size={12} /> Más
            <ChevronDown class="chevron" size={12} />
          </summary>
          <div class="more-menu">
            <button class="btn tiny ghost" onclick={() => begin('correct')}><Pencil size={12} /> Corregir</button>
            <button class="btn tiny ghost" onclick={() => ignoreCard(card)}><EyeOff size={12} /> Ignorar</button>
            <div class="scope-pick" role="group" aria-label="Se aplica a">
              <span class="scope-title"><Globe size={12} /> Se aplica a</span>
              {#each scopes as s (s)}
                <button class="btn tiny ghost" class:on={card.scope === s} aria-pressed={card.scope === s} onclick={() => setScope(card, s)}>
                  {#if card.scope === s}<Check size={12} />{/if} {scopeNames[s]}
                </button>
              {/each}
            </div>
            <button class="btn tiny ghost" onclick={() => removeCard(card)}><Trash size={12} /> Quitar</button>
          </div>
        </details>
      {:else if card.type === 'preferencia'}
        {#if card.state === 'confirmado'}<span class="state">elegida</span>{/if}
        {#if card.state === 'ignorado'}<span class="state">ignorada</span>{/if}
        <details class="more">
          <summary class="btn tiny ghost more-toggle">
            <Ellipsis size={12} /> Ajustar
            <ChevronDown class="chevron" size={12} />
          </summary>
          <div class="more-menu">
            <div class="scope-pick" role="group" aria-label="Se aplica a">
              <span class="scope-title"><Globe size={12} /> Se aplica a</span>
              {#each scopes as s (s)}
                <button class="btn tiny ghost" class:on={card.scope === s} aria-pressed={card.scope === s} onclick={() => setScope(card, s)}>
                  {#if card.scope === s}<Check size={12} />{/if} {scopeNames[s]}
                </button>
              {/each}
            </div>
            <button class="btn tiny ghost" onclick={() => removeCard(card)}><Trash size={12} /> Descartar</button>
          </div>
        </details>
      {:else}
        <button class="btn tiny" onclick={pinOwner}>
          {#if owner?.pinned}<PinOff size={12} /> Quitar{:else}<Pin size={12} /> Fijar{/if}
        </button>
        <button class="btn tiny ghost" onclick={exportCard}><Download size={12} /> Exportar</button>
      {/if}
    </div>
  {/if}
</div>
