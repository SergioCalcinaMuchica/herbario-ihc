<script lang="ts">
  import {
    GitFork,
    Leaf,
    Send,
    Square,
    TriangleExclamationPoint,
    WandSparkles
  } from '@lucide/svelte';
  import {
    activeBranch,
    activeNode,
    app,
    childrenOf,
    forkSource,
    promptSpecies,
    send,
    stopGeneration,
    streamingNode,
    suggestAssumptions
  } from '#lib/store.svelte';
  import { detectBrief, questionsFor } from '#lib/brief';
  import BriefWizard from './BriefWizard.svelte';

  let briefOpen = $state(false);
  let textarea: HTMLTextAreaElement | undefined = $state();

  const streaming = $derived(streamingNode());
  const branch = $derived(activeBranch());
  const current = $derived(activeNode());
  const children = $derived(childrenOf(current));
  const fork = $derived(forkSource());
  const named = $derived(promptSpecies(app.composer));
  const mismatch = $derived(
    named &&
      branch?.species &&
      branch.species !== 'Selección' &&
      branch.species !== 'Varias especies' &&
      branch.species !== named
      ? named
      : null
  );
  const canSend = $derived(!!app.composer.trim() && !streaming);
  const activeGoal = $derived(app.brief.goal || current?.brief?.goal || '');
  const placeholder = $derived(
    activeGoal === 'elegir' || branch?.species === 'Varias especies'
      ? 'Describe tu espacio, luz, riego o si hay mascotas…'
      : activeGoal === 'identificar'
        ? 'Describe hojas, tallo, tamaño o dónde está la planta…'
        : 'Cuéntame qué le pasa a tu planta…'
  );
  const detected = $derived(detectBrief(app.composer));
  const hints = $derived(suggestAssumptions(app.composer, { ...detected, ...app.brief }));
  const visibleHints = $derived(hints.filter((h) => !app.assumptionOff[h.id]));

  function hintValue(id: string, fallback: string) {
    return app.assumptionEdits[id] ?? fallback;
  }

  function editHint(id: string, value: string) {
    app.assumptionEdits[id] = value;
  }

  function removeHint(id: string) {
    app.assumptionOff[id] = true;
  }

  function restoreHints() {
    app.assumptionEdits = {};
    app.assumptionOff = {};
  }

  function assumptions() {
    const fromHints = visibleHints.map((h) => ({ text: hintValue(h.id, h.text) }));
    const fromQuestions = questionsFor(app.composer, app.brief).map((q) => ({
      text: q.assumption,
      detail: `No lo respondiste. ${q.detail}`
    }));

    const seen = new Set<string>();
    return [...fromHints, ...fromQuestions]
      .filter((a) => {
        const key = a.text.trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 3);
  }

  function submit() {
    if (!canSend) return;
    if (mismatch) return;
    send(assumptions());
  }

  function sendForSpecies() {
    if (!mismatch) return;
    send(assumptions(), { newSpecies: mismatch });
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  $effect(() => {
    if (!app.activeNodeId) textarea?.focus();
  });
</script>

<div class="composer" aria-label="Nueva consulta">
  <div class="composer-box">
    <BriefWizard bind:open={briefOpen} />

    {#if mismatch}
      <div class="species-warning" role="alert">
        <div>
          <strong><TriangleExclamationPoint size={14} /> Estás en {branch?.name} ({branch?.species})</strong>
          <p>
            Tu mensaje habla de {mismatch}. Si genero aquí, mezclo el contexto de dos plantas.
          </p>
        </div>
        <button class="btn primary" onclick={sendForSpecies}>
          Crear conversación de {mismatch.split(' ')[0]}
        </button>
      </div>
    {/if}

    {#if !mismatch && (fork || children.length)}
      <div class="fork-note" role="status">
        {#if fork}
          <strong><GitFork size={14} /> Conversación nueva desde «{fork.title}»</strong>
          <span>La respuesta original no cambia. Al generar, esta pregunta queda en una conversación aparte.</span>
        {:else}
          <strong><GitFork size={14} /> Estás en una respuesta anterior.</strong>
          <span>Lo que generes aquí abre una conversación nueva; las demás se conservan.</span>
        {/if}
      </div>
    {/if}

    <label class="sr-only" for="prompt">Mensaje</label>
    <textarea
      id="prompt"
      bind:this={textarea}
      bind:value={app.composer}
      rows="1"
      {placeholder}
      onkeydown={onKey}
    ></textarea>

    <div class="composer-foot">
      <span class="composer-hint">
        <Leaf size={12} />
        {#if branch}<span>{branch.name} · {branch.species}</span>{:else}Conversación nueva{/if}
        <span class="sep">·</span><kbd>Enter</kbd> para generar
      </span>
      <div class="composer-actions">
        <button
          class="btn ghost"
          onclick={() => (briefOpen = !briefOpen)}
        ><WandSparkles size={15} /> Afina la respuesta</button>
        {#if streaming}
          <button class="btn stop" onclick={stopGeneration}><Square size={12} /> Detener</button>
        {:else}
          <button class="btn primary" disabled={!canSend || !!mismatch} onclick={submit}><Send size={14} /> Generar</button>
        {/if}
      </div>
    </div>
  </div>
</div>
