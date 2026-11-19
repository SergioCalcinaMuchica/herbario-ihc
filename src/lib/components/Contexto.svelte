<script lang="ts">
  import { ChevronDown, GitFork, Layers, Lightbulb, ScrollText, UserRound, WandSparkles } from '@lucide/svelte';
  import type { KnowledgeNode } from '#lib/types';
  import { inheritedCards, openLedger } from '#lib/store.svelte';
  import Carta from './Carta.svelte';

  let { node }: { node: KnowledgeNode } = $props();

  let open = $state<'user' | 'assumed' | 'proposed' | null>(null);
  let panel: HTMLElement | undefined = $state();

  $effect(() => {
    if (open) queueMicrotask(() => panel?.scrollIntoView({ block: 'nearest' }));
  });

  const userCards = $derived(node.cards.filter((c) => c.source === 'usuario' && c.state !== 'ignorado'));
  const assumed = $derived(
    node.cards.filter((c) => c.type === 'supuesto' && c.source !== 'usuario' && c.state !== 'ignorado')
  );
  const proposed = $derived(
    node.cards.filter((c) => c.source === 'ia' && c.type !== 'supuesto' && c.state !== 'ignorado')
  );
  const inherited = $derived(inheritedCards(node));
  const pending = $derived(assumed.filter((c) => c.state === 'sin_confirmar').length);
  const userCount = $derived(userCards.length);

  function toggle(which: 'user' | 'assumed' | 'proposed') {
    open = open === which ? null : which;
  }
</script>

<section class="context-strip" aria-label="Contexto de esta respuesta" bind:this={panel}>
  <div class="context-head">
    <div>
      <h2><Layers size={15} /> Contexto de esta respuesta</h2>
      <p>Tus datos, lo que la IA supuso y lo que propuso.</p>
    </div>
    <button class="btn tiny ghost" onclick={() => openLedger('lamina')}><ScrollText size={13} /> Ver historial</button>
  </div>

  <div class="voice-counts">
    <button
      class="voice-count"
      class:active={open === 'user'}
      aria-expanded={open === 'user'}
      onclick={() => toggle('user')}
      aria-label={`Tus datos: ${userCount}`}
    >
      <span class="voice-icon" aria-hidden="true"><UserRound size={16} /></span>
      <strong>{userCount}</strong>
      <span class="voice-label">Tus datos</span>
      <span class="voice-cue">
        <span class="cue-text">{open === 'user' ? 'Ocultar' : 'Ver'}</span>
        <ChevronDown class="chevron" size={13} />
      </span>
    </button>
    <button
      class="voice-count assumed"
      class:active={open === 'assumed'}
      aria-expanded={open === 'assumed'}
      onclick={() => toggle('assumed')}
      aria-label={`La IA supuso: ${assumed.length}${pending ? `, ${pending} por confirmar` : ''}`}
    >
      <span class="voice-icon" aria-hidden="true"><Lightbulb size={16} /></span>
      <strong>{assumed.length}</strong>
      <span class="voice-label">La IA supuso</span>
      <span class="voice-cue">
        <span class="cue-text">{open === 'assumed' ? 'Ocultar' : 'Ver'}</span>
        <ChevronDown class="chevron" size={13} />
      </span>
    </button>
    <button
      class="voice-count proposed"
      class:active={open === 'proposed'}
      aria-expanded={open === 'proposed'}
      onclick={() => toggle('proposed')}
      aria-label={`La IA propuso: ${proposed.length}`}
    >
      <span class="voice-icon" aria-hidden="true"><WandSparkles size={16} /></span>
      <strong>{proposed.length}</strong>
      <span class="voice-label">La IA propuso</span>
      <span class="voice-cue">
        <span class="cue-text">{open === 'proposed' ? 'Ocultar' : 'Ver'}</span>
        <ChevronDown class="chevron" size={13} />
      </span>
    </button>
  </div>

  {#if open === 'user'}
    <div class="voice-panel" id="voice-user">
      {#each userCards as card (card.id)}
        <Carta {card} compact />
      {:else}
        <p class="voice-empty">
          No añadiste datos extra. Tu mensaje completo está arriba, en «Tu mensaje».
        </p>
      {/each}
    </div>
  {:else if open === 'assumed'}
    <div class="voice-panel" id="voice-assumed">
      {#if pending}
        <p class="voice-note">{pending} {pending === 1 ? 'suposición sin confirmar' : 'suposiciones sin confirmar'} · revisa y confirma o corrige.</p>
      {/if}
      {#each assumed as card (card.id)}
        <Carta {card} compact />
      {:else}
        <p class="voice-empty">No hay suposiciones. Todo lo que ves está confirmado o lo aportaste tú.</p>
      {/each}
    </div>
  {:else if open === 'proposed'}
    <div class="voice-panel" id="voice-proposed">
      {#each proposed as card (card.id)}
        <Carta {card} compact />
      {:else}
        <p class="voice-empty">La IA no generó materiales aparte de la respuesta.</p>
      {/each}
    </div>
  {/if}

  {#if inherited.length}
    <p class="inherited-line">
      <GitFork size={13} />
      {inherited.length} {inherited.length === 1 ? 'nota viene' : 'notas vienen'} de otras respuestas.
      <button class="link" onclick={() => openLedger('heredado')}>Ver de dónde vienen</button>
    </p>
  {/if}
</section>
