<script lang="ts">
  import { Check, ChevronDown, CircleQuestionMark, Lightbulb, Sparkles, X } from '@lucide/svelte';
  import { app, briefSummary, promptSpecies, suggestAssumptions } from '#lib/store.svelte';
  import {
    applySymptom,
    detectBrief,
    inferGoal,
    questionsFor,
    type BriefGoal,
    type BriefQuestion
  } from '#lib/brief';
  import type { Brief } from '#lib/types';

  let { open = $bindable(false) } = $props();

  let asked = $state<string[]>([]);
  let skipped = $state<BriefQuestion[]>([]);

  const detected = $derived(detectBrief(app.composer));
  const explicitBrief = $derived({ ...detected, ...app.brief });
  const displayBrief: Brief = $derived({
    ...explicitBrief,
    goal: (app.brief.goal || inferGoal(app.composer) || '') as Brief['goal']
  });
  const questions = $derived(questionsFor(app.composer, app.brief));
  const remaining = $derived(
    asked.length >= 3
      ? []
      : questions.filter((q) => !asked.includes(q.id)).slice(0, 3 - asked.length)
  );
  const current = $derived(remaining[0]);
  const skippedVisible = $derived(skipped.slice(0, 2));
  const hints = $derived(suggestAssumptions(app.composer, explicitBrief));
  const visibleHints = $derived(
    hints.filter((h) => {
      if (app.assumptionOff[h.id]) return false;
      if (h.id === 'drenaje' && questions.some((q) => q.target === 'drainage')) return false;
      if (h.id === 'riego_reciente' && questions.some((q) => q.target === 'water')) return false;
      return true;
    })
  );

  const known = $derived.by(() => {
    const out: string[] = [];
    const plant = promptSpecies(app.composer);
    if (plant) out.push(plant);
    out.push(...briefSummary(displayBrief));

    const t = app.composer.toLowerCase();
    if (/hoja.*amarill|amarill.*hoja/.test(t)) out.push('Hojas amarillas');
    if (/mancha/.test(t)) out.push('Manchas');
    if (/enroll/.test(t)) out.push('Hojas enrolladas');
    if (/borde.*seco|seco.*borde/.test(t)) out.push('Bordes secos');
    if (/tierra.*h[úu]med|sustrato.*h[úu]med/.test(t)) out.push('Sustrato húmedo');

    return [...new Set(out)].slice(0, 4);
  });

  $effect(() => {
    if (!app.composer.trim() && !Object.values(app.brief).some(Boolean)) {
      if (asked.length) asked = [];
      if (skipped.length) skipped = [];
    }
  });

  function answer(question: BriefQuestion, value: string) {
    if (question.target === 'symptom') {
      app.composer = applySymptom(app.composer, value);
    } else if (question.target === 'goal') {
      app.brief.goal = value as BriefGoal;
    } else {
      (app.brief as Record<string, string>)[question.target] = value;
    }
    asked = [...asked, question.id];
    skipped = skipped.filter((q) => q.id !== question.id);
  }

  function skip(question: BriefQuestion) {
    asked = [...asked, question.id];
    skipped = [...skipped.filter((q) => q.id !== question.id), question];
  }

  function reopen(question: BriefQuestion) {
    asked = asked.filter((id) => id !== question.id);
    skipped = skipped.filter((q) => q.id !== question.id);
    open = true;
  }

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
</script>

{#if open || app.composer.trim().length > 4}
  <div class="brief-line">
    <div class="brief-known">
      <span class="brief-label"><Sparkles size={12} /> Entiendo</span>
      {#each known as item (item)}
        <span class="brief-chip">{item}</span>
      {/each}
      {#each skippedVisible as question (question.id)}
        <button
          class="brief-chip skipped"
          title="Volver a responder: {question.title}"
          onclick={() => reopen(question)}
        >
          <CircleQuestionMark size={11} /> {question.chip}
        </button>
      {/each}
      {#if !known.length && !skippedVisible.length}
        <span class="brief-chip muted">Solo tu mensaje</span>
      {/if}
    </div>

    <button
      class="brief-trigger"
      class:done={!remaining.length}
      aria-expanded={open}
      aria-controls="brief-panel"
      onclick={() => (open = !open)}
    >
      {#if remaining.length}
        <span class="brief-dot" aria-hidden="true"></span>
        {remaining.length} dato{remaining.length === 1 ? '' : 's'} para afinar
      {:else}
        <Check size={13} /> Listo
      {/if}
      <ChevronDown size={14} class="brief-chevron {open ? 'rotated' : ''}" />
    </button>
  </div>
{/if}

{#if open}
  <div class="brief-panel" id="brief-panel">
    {#if current}
      <div class="brief-question">
        <div class="brief-q-head">
          <span class="brief-q-icon" aria-hidden="true"><Lightbulb size={16} /></span>
          <div class="brief-q-copy">
            <p class="brief-q-kicker">Puedo afinar con esto</p>
            <h3>{current.title}</h3>
            <p class="brief-q-help">{current.help}</p>
          </div>
          <button class="icon-btn mini" aria-label="Cerrar preguntas" onclick={() => (open = false)}>
            <X size={14} />
          </button>
        </div>

        <div class="brief-options">
          {#each current.options as option (option.value)}
            <button class="brief-option" onclick={() => answer(current, option.value)}>
              <span>{option.label}</span>
              {#if option.hint}<small>{option.hint}</small>{/if}
            </button>
          {/each}
        </div>

        <div class="brief-q-foot">
          <button class="link" onclick={() => skip(current)}>No lo sé; asúmelo</button>
          <span>Si no respondes, lo marco en la respuesta.</span>
        </div>
      </div>
    {:else}
      <div class="brief-done">
        <span class="brief-done-icon" aria-hidden="true"><Check size={15} /></span>
        <div>
          <strong>Con esto puedo responder.</strong>
          <p>Genera cuando quieras; lo que no hayas marcado aparecerá como suposición editable.</p>
        </div>
      </div>
    {/if}

    {#if visibleHints.length}
      <div class="brief-assumes">
        <span class="brief-assumes-label">También asumiré</span>
        {#each visibleHints as hint (hint.id)}
          <label class="brief-assume">
            <input
              value={hintValue(hint.id, hint.text)}
              aria-label="Editar suposición"
              oninput={(e: Event) => editHint(hint.id, (e.currentTarget as HTMLInputElement).value)}
            />
            <button
              class="brief-assume-x"
              type="button"
              aria-label="Quitar suposición"
              onclick={() => removeHint(hint.id)}
            ><X size={12} /></button>
          </label>
        {/each}
        <button class="link" onclick={restoreHints}>Restaurar</button>
      </div>
    {/if}
  </div>
{/if}
