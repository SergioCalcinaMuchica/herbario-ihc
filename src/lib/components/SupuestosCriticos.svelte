<script lang="ts">
  import { Check, Pencil } from '@lucide/svelte';
  import { activeNode, confirmCard, correctCard, openLedger, unconfirmed } from '#lib/store.svelte';

  const node = $derived(activeNode());
  const critical = $derived(unconfirmed(node));

  let editing = $state(false);
  let draft = $state('');

  function startEdit() {
    if (!critical.length) return;
    draft = critical[0].text;
    editing = true;
  }

  function save() {
    if (!critical.length) return;
    const text = draft.trim();
    if (!text) return;
    correctCard(critical[0], text);
    editing = false;
  }

  function cancel() {
    editing = false;
  }
</script>

{#if critical.length}
  <section class="assumptions-bar" aria-label="Supuestos por confirmar">
    <span class="q" aria-hidden="true">?</span>

    <div class="bar-text">
      <strong>
        {critical.length === 1
          ? 'Asumí algo que no me dijiste'
          : `Asumí ${critical.length} cosas que no me dijiste (1 de ${critical.length})`}
      </strong>

      {#if !editing}
        <span class="first">{critical[0].text}</span>
        {#if critical[0].detail}<span class="why">{critical[0].detail}</span>{/if}
      {:else}
        <form
          class="bar-edit"
          onsubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input bind:value={draft} aria-label="Corregir supuesto" />
          <button class="btn tiny primary" type="submit">Guardar</button>
          <button class="btn tiny ghost" type="button" onclick={cancel}>Cancelar</button>
        </form>
      {/if}
    </div>

    {#if !editing}
      <div class="bar-actions">
        <button class="btn tiny primary" onclick={() => confirmCard(critical[0])}>
          <Check size={13} /> Confirmar
        </button>
        <button class="btn tiny" onclick={startEdit}><Pencil size={12} /> Corregir</button>
        {#if critical.length > 1}
          <button class="btn tiny ghost" onclick={() => openLedger('lamina')}>
            Ver {critical.length - 1} más
          </button>
        {/if}
      </div>
    {/if}
  </section>
{/if}
