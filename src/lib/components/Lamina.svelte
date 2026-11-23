<script lang="ts">
  import {
    ArrowDownToLine,
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    Check,
    ChevronDown,
    CircleCheck,
    CircleQuestionMark,
    CircleExclamationPoint,
    CirclePause,
    Download,
    Droplets,
    FlaskConical,
    Flower2,
    Gauge,
    Info,
    Layers,
    Leaf,
    LoaderCircle,
    MessagesSquare,
    PawPrint,
    Pin,
    RefreshCw,
    Ruler,
    ScanLine,
    Sparkles,
    Sprout,
    Square,
    Sun,
    Thermometer,
    TriangleExclamationPoint,
    Undo2,
    UserRound,
    Wind,
    X
  } from '@lucide/svelte';
  import type { Candidate, KnowledgeNode, Term } from '#lib/types';
  import {
    activeNode,
    allNodes,
    app,
    chooseCandidate,
    discardDraft,
    lineCount,
    openLedger,
    openNode,
    recalc,
    reformulate,
    regenerate,
    replaceTerm,
    restoreTerms,
    resume,
    stopGeneration,
    togglePin,
    toast
  } from '#lib/store.svelte';
  import {
    applyCandOption,
    applyParamOption,
    CAND_OPTIONS,
    makeShorter,
    makeSimpler,
    paramOptions
  } from '#lib/engine/ajustes';
  import Contexto from './Contexto.svelte';
  import PlantArt from './PlantArt.svelte';
  import SupuestosCriticos from './SupuestosCriticos.svelte';

  const node = $derived(activeNode());
  const parentNode = $derived(
    node?.parentId ? allNodes().find((n) => n.id === node.parentId) : undefined
  );
  const parentDiff = $derived.by(() => {
    if (!node || !parentNode) return [];
    const out: string[] = [];
    if (node.species !== parentNode.species) {
      out.push(`Especie: ${parentNode.species} → ${node.species}`);
    }
    if (node.actions.length !== parentNode.actions.length) {
      out.push(`Pasos: ${parentNode.actions.length} → ${node.actions.length}`);
    }
    const parentAssumed = new Set(
      parentNode.cards.filter((c) => c.type === 'supuesto').map((c) => c.text)
    );
    const newAssumed = node.cards.filter(
      (c) => c.type === 'supuesto' && !parentAssumed.has(c.text)
    ).length;
    if (newAssumed) out.push(`${newAssumed} suposición${newAssumed === 1 ? '' : 'es'} nueva${newAssumed === 1 ? '' : 's'}`);
    if (node.esencia !== parentNode.esencia && !out.length) {
      out.push('Síntesis reformulada respecto al original');
    }
    return out;
  });
  const lines = $derived(node ? lineCount(node) : 0);
  const generating = $derived(node?.status === 'generando');
  const done = $derived(node?.done ?? 0);
  const total = $derived(node?.milestones.length || 1);
  const percent = $derived(Math.min(100, Math.round((done / total) * 100)));

  let openTerm = $state<Term | null>(null);
  // Respuesta recién actualizada: el aviso verde se muestra en el lugar del aviso de desactualizada.
  let updatedId = $state('');

  // Ajustes directos sobre la ficha: cada cambio se puede deshacer, y el «Deshacer»
  // aparece junto a la parte que cambió (`changed` dice cuál).
  let undo = $state<{ nodeId: string; before: string } | null>(null);
  let changed = $state('');

  function snapshot(n: KnowledgeNode) {
    const { esencia, params, actions, candidates, replaced, stepsDone } = n;
    return JSON.stringify({ esencia, params, actions, candidates, replaced, stepsDone });
  }

  /** Aplica un ajuste guardando cómo estaba antes. Si el ajuste no pudo hacerse, avisa y no cambia nada. */
  function adjust(n: KnowledgeNode, key: string, fn: () => boolean | void, failMessage = '') {
    const before = snapshot(n);
    if (fn() === false) {
      if (failMessage) toast(failMessage);
      return;
    }
    undo = { nodeId: n.id, before };
    changed = key;
  }

  function undoAdjust(n: KnowledgeNode) {
    if (!undo || undo.nodeId !== n.id) return;
    const prev = JSON.parse(undo.before);
    n.esencia = prev.esencia;
    n.params = prev.params;
    n.actions = prev.actions;
    n.candidates = prev.candidates;
    n.replaced = prev.replaced;
    n.stepsDone = prev.stepsDone ?? [];
    undo = null;
    changed = '';
  }

  const canUndo = (key: string) => undo !== null && undo.nodeId === node?.id && changed === key;

  /** Cierra el menú desplegable desde el que se eligió una opción. */
  function closeMenu(e: Event) {
    (e.currentTarget as HTMLElement).closest('details')?.removeAttribute('open');
  }

  // Cambiar candidatas solo tiene sentido al escoger una planta, no al identificarla.
  const candAdjustable = $derived(node?.species !== 'Especie por identificar');
  let lastNodeId = $state('');

  const doors = [
    {
      title: 'Escoger una planta',
      text: 'Dime cómo es tu espacio y qué buscas.',
      goal: 'elegir' as const,
      prompt: 'Quiero elegir una planta para interior. Tengo poca luz y riego poco.'
    },
    {
      title: 'Identificar una planta',
      text: 'Cuéntame cómo son sus hojas y su color.',
      goal: 'identificar' as const,
      prompt: 'Quiero saber qué planta tengo. Sus hojas son grandes, verdes y con agujeros.'
    },
    {
      title: 'Conocer sus cuidados',
      text: 'Luz, riego, tierra y maceta, y el porqué de cada uno.',
      goal: 'cuidar' as const,
      prompt: 'Tengo un potos. ¿Cuánta luz y cuánto riego necesita?'
    }
  ];

  const doorIcons = [Flower2, ScanLine, Droplets];

  /** Separa un texto con varias ideas (unidas por «;» o por frases) para mostrarlo como lista. */
  function ideas(text: string) {
    return text
      .split(/;\s+|(?<=[^\d]\.)\s+/)
      .map((part) => part.trim().replace(/\.$/, ''))
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1));
  }

  function paramIcon(label: string) {
    const key = label.toLowerCase();
    if (key.startsWith('luz') || key.startsWith('sol')) return Sun;
    if (key.startsWith('agua') || key.startsWith('riego')) return Droplets;
    if (key.startsWith('drenaje')) return ArrowDownToLine;
    if (key.startsWith('mascota')) return PawPrint;
    if (key.startsWith('temperatura')) return Thermometer;
    if (key.startsWith('humedad')) return Wind;
    if (key.startsWith('sustrato')) return Layers;
    if (key.startsWith('época') || key.startsWith('epoca')) return CalendarDays;
    if (key.startsWith('corte')) return ScanLine;
    if (key.startsWith('retiro') || key.startsWith('frecuencia')) return RefreshCw;
    if (key.startsWith('npk') || key.startsWith('abono')) return FlaskConical;
    if (key.startsWith('tamaño') || key.startsWith('tamano') || key.startsWith('espacio') || key.startsWith('porte')) return Ruler;
    if (key.startsWith('dificultad')) return Gauge;
    return Leaf;
  }

  function startWith(door: (typeof doors)[number]) {
    app.composer = door.prompt;
    app.brief = { goal: door.goal };
    app.activeNodeId = '';
    app.forkFromId = '';
    app.branchTarget = 'new';
    app.newBranchName = '';
    app.leftOpen = false;
    app.rightOpen = false;
  }

  const petLabel: Record<Candidate['pets'], string> = {
    segura: 'Segura',
    precaucion: 'Con precaución',
    toxica: 'Tóxica'
  };

  const statusLabels: Record<KnowledgeNode['status'], string> = {
    lista: 'Completa',
    generando: 'Generando',
    borrador: 'Borrador',
    desactualizada: 'Desactualizada'
  };

  /** Marca o desmarca un paso de «Qué hacer» para que el usuario sepa por dónde va. */
  function toggleStep(n: KnowledgeNode, i: number) {
    const marked = n.stepsDone ?? [];
    n.stepsDone = marked.includes(i) ? marked.filter((x) => x !== i) : [...marked, i];
  }

  function segments(n: KnowledgeNode) {
    const terms = [...n.terms].sort((a, b) => b.word.length - a.word.length);
    const out: { text: string; term?: Term }[] = [];
    let rest = n.esencia;
    while (rest) {
      const found = terms.find((t) => rest.toLowerCase().includes(t.word.toLowerCase()));
      if (!found) {
        out.push({ text: rest });
        break;
      }
      const index = rest.toLowerCase().indexOf(found.word.toLowerCase());
      if (index > 0) out.push({ text: rest.slice(0, index) });
      // La marca abarca la palabra entera («tóxicas»), para que el «?» no quede en medio.
      let end = index + found.word.length;
      while (end < rest.length && /\p{L}/u.test(rest[end])) end++;
      out.push({ text: rest.slice(index, end), term: found });
      rest = rest.slice(end);
    }
    return out;
  }

  function apply(term: Term, scope: 'hilo' | 'especie' | 'global') {
    if (!node) return;
    replaceTerm(node, term, scope);
    openTerm = null;
  }

  function download() {
    if (!node) return;
    const context = node.cards
      .map((c) => `- [${c.type}] ${c.text} (${c.source === 'usuario' ? 'tú' : 'IA'})`)
      .join('\n');
    const md = [
      `# ${node.title}`,
      `Especie: ${node.species}`,
      `Fecha: ${node.date}`,
      '',
      '## Lo que pediste',
      node.prompt,
      '',
      '## Respuesta',
      node.esencia,
      '',
      '## Acciones',
      ...node.actions.map((a) => `- ${a}`),
      '',
      '## Parámetros',
      ...node.params.map((p) => `- ${p.label}: ${p.value}`),
      '',
      '## Contexto',
      context,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `respuesta-${node.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Respuesta exportada');
  }

  $effect(() => {
    const id = node?.id ?? '';
    if (id !== lastNodeId) {
      openTerm = null;
      lastNodeId = id;
    }
  });

  function onWindowClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.term-wrap')) openTerm = null;
    // Solo un menú abierto a la vez: al tocar fuera de un menú, o al abrir otro, se cierra el anterior.
    document.querySelectorAll('details.more[open]').forEach((d) => {
      if (!d.contains(target)) d.removeAttribute('open');
    });
  }
</script>

<svelte:window onclick={onWindowClick} />

{#if !node}
  <section class="empty">
    <div class="empty-badge" aria-hidden="true"><Sprout size={34} /></div>
    <p class="eyebrow"><Leaf size={12} /> Herbario · asistente botánico</p>
    <h1>¿Qué quieres entender hoy?</h1>
    <p class="empty-lead">
      No necesitas saber de plantas. Cuéntame lo que ves y te pregunto lo que falte.
    </p>
    <div class="doors">
      {#each doors as door, i (door.title)}
        {@const DoorIcon = doorIcons[i]}
        <button class="door" onclick={() => startWith(door)}>
          <span class="door-icon" aria-hidden="true"><DoorIcon size={20} /></span>
          <strong>{door.title}</strong>
          <span>{door.text}</span>
          <span class="door-arrow" aria-hidden="true"><ArrowUpRight size={17} /></span>
        </button>
      {/each}
    </div>
    <p class="empty-note"><Info size={13} /> Puedes detener la respuesta en cualquier momento: lo que ya salió queda como borrador.</p>
  </section>
{:else}
  <article class="lamina">
    <header class="lamina-head">
      <div class="titles">
        <p class="eyebrow"><Flower2 size={12} /> {node.species} · {node.date}</p>
        <h1>{node.title}</h1>
        <p class="meta">
          <span><CalendarDays size={11} /> {node.generatedAt}</span>
          <span class="status {node.status}">{statusLabels[node.status]}</span>
          {#if parentNode}
            <button class="link" onclick={() => openNode(parentNode.id)}>Desde: {parentNode.title}</button>
          {/if}
          {#if lines > 1}
            <span class="lines" title={`${lines} continuaciones desde esta respuesta`}>{lines} continuaciones</span>
          {/if}
        </p>
      </div>
      <div class="head-actions">
        <button class="btn ghost" aria-pressed={node.pinned} onclick={() => togglePin(node)}>
          <Pin size={15} fill={node.pinned ? 'currentColor' : 'none'} /> {node.pinned ? 'Fijado' : 'No fijado'}
        </button>
        <button class="btn ghost" onclick={() => regenerate(node)}><RefreshCw size={15} /> Otra versión</button>
        <button class="btn ghost" onclick={download}><Download size={15} /> Descargar</button>
      </div>
    </header>

    {#if generating}
      <div class="gen-state" role="status">
        <div>
          <strong><LoaderCircle class="spin" size={16} /> Generando respuesta</strong>
          <span>{done} de {total} · puedes detener y conservar lo parcial</span>
        </div>
        <div class="gen-bar" aria-hidden="true"><span style={`width:${percent}%`}></span></div>
        <button class="btn stop" onclick={stopGeneration}><Square size={12} /> Detener</button>
      </div>
    {:else if node.status === 'borrador'}
      <div class="banner">
        <CirclePause size={17} />
        <div><strong>Detenido.</strong> Lo que ya se generó queda como borrador.</div>
        <div class="banner-actions">
          <button class="btn tiny primary" onclick={() => resume(node)}>Reanudar</button>
          <button class="btn tiny ghost" onclick={() => discardDraft(node)}>Descartar</button>
        </div>
      </div>
    {:else if node.status === 'desactualizada'}
      <div class="banner">
        <CircleExclamationPoint size={17} />
        <div>
          <strong>El contexto cambió:</strong>
          {node.staleReason ?? 'esta respuesta puede estar desactualizada.'}
        </div>
        <button class="btn tiny primary" onclick={() => { recalc(node); updatedId = node.id; }}>Actualizar respuesta</button>
      </div>
    {:else if updatedId === node.id}
      <div class="banner ok" role="status">
        <CircleCheck size={17} />
        <div><strong>La respuesta se actualizó con tus cambios.</strong></div>
        <button class="icon-btn mini" aria-label="Cerrar aviso" onclick={() => (updatedId = '')}><X size={14} /></button>
      </div>
    {/if}

    {#if node.prompt}
      <section class="ask" aria-label="Tu mensaje">
        <span class="ask-icon" aria-hidden="true"><UserRound size={15} /></span>
        <div>
          <span class="ask-label">Tu mensaje</span>
          <p class="ask-text">{node.prompt}</p>
        </div>
      </section>
    {/if}

    {#if node.esencia}
      <section class="essence" aria-label="Respuesta">
        <div class="essence-head">
          <p class="eyebrow"><Sparkles size={12} /> Respuesta</p>
          <div class="adjust-bar" role="group" aria-label="Ajustar toda la respuesta">
            <button class="btn tiny ghost" onclick={() => adjust(node, 'todo', () => makeShorter(node), 'La respuesta ya está lo más corta posible.')}>Más corta</button>
            <button class="btn tiny ghost" onclick={() => adjust(node, 'todo', () => makeSimpler(node), 'No hay palabras difíciles en esta respuesta.')}>Más simple</button>
            {#if canUndo('todo')}<button class="btn tiny ghost" onclick={() => undoAdjust(node)}><Undo2 size={12} /> Deshacer</button>{/if}
          </div>
        </div>
        <p class="essence-text">
          {#each segments(node) as part}
            {#if part.term}
              <span class="term-wrap">
                <button class="term" onclick={() => (openTerm = openTerm?.word === part.term?.word ? null : part.term!)}>
                  {node.replaced[part.term.word] ?? part.text}<sup>?</sup>
                </button>
                {#if openTerm?.word === part.term.word}
                  <span class="popover">
                    <button class="icon-btn mini pop-close" aria-label="Cerrar" onclick={() => (openTerm = null)}><X size={12} /></button>
                    <strong>{part.term.word}</strong>
                    <span class="def">{part.term.def}</span>
                    <span class="popover-label">Cambiar por lenguaje llano en:</span>
                    <span class="popover-actions">
                      <button class="btn tiny" onclick={() => apply(part.term!, 'hilo')}>Esta conversación</button>
                      <button class="btn tiny" onclick={() => apply(part.term!, 'especie')}>Esta planta</button>
                      <button class="btn tiny" onclick={() => apply(part.term!, 'global')}>Siempre</button>
                    </span>
                  </span>
                {/if}
              </span>
            {:else}
              {part.text}
            {/if}
          {/each}
        </p>
      </section>
    {/if}

    <SupuestosCriticos />

    {#if done >= 3 && node.candidates?.length}
      <section class="candidates" aria-label="Plantas candidatas">
        {#each node.candidates as c, i (c.id)}
          <article class="cand">
            <div class="cand-art"><PlantArt art={c.art} color={c.color} /></div>
            <div class="cand-body">
              <h3>{c.name}</h3>
              <p class="scientific">{c.scientific}</p>
              <p class="fit">{c.fit}</p>
              <p class="needs">{c.needs}</p>
              <dl class="cand-table">
                <div><dt>Luz</dt><dd>{c.light}</dd></div>
                <div><dt>Riego</dt><dd>{c.water}</dd></div>
                <div><dt>Tamaño</dt><dd>{c.size}</dd></div>
                <div><dt>Mascotas</dt><dd class="pet {c.pets}">{#if c.pets === 'segura'}<Check size={13} />{:else if c.pets === 'precaucion'}<CircleExclamationPoint size={13} />{:else}<TriangleExclamationPoint size={13} />{/if} {petLabel[c.pets]}</dd></div>
              </dl>
              <div class="cand-actions">
                <button class="btn tiny" onclick={() => chooseCandidate(c)}>Elegir esta <ArrowRight size={13} /></button>
                {#if candAdjustable}
                  <details class="more">
                    <summary class="btn tiny ghost more-toggle">Cambiar <ChevronDown class="chevron" size={12} /></summary>
                    <div class="more-menu">
                      {#each CAND_OPTIONS as o (o.id)}
                        <button class="btn tiny ghost" onclick={(e) => { closeMenu(e); adjust(node, 'plantas', () => applyCandOption(node, i, o.id), 'No encontré otra planta que cumpla eso.'); }}>{o.label}</button>
                      {/each}
                    </div>
                  </details>
                {/if}
              </div>
            </div>
          </article>
        {/each}
      </section>
      {#if canUndo('plantas')}
        <p class="adjust-done"><CircleCheck size={14} /> Cambiaste las plantas candidatas. <button class="link" onclick={() => undoAdjust(node)}>Deshacer</button></p>
      {/if}
      {#if node.brief?.pets === 'mascotas' || node.candidates.some((c) => c.pets !== 'segura')}
        <p class="safety-note" role="note">
          <TriangleExclamationPoint size={15} />
          Orientación botánica general: si convives con mascotas que muerden hojas, confirma la toxicidad exacta con un veterinario.
        </p>
      {/if}
    {/if}

    {#if done >= 1 && node.actions.length}
      <section class="actions" aria-label="Acciones">
        <h2>Qué hacer <span class="steps-count">{node.stepsDone?.length ?? 0} de {node.actions.length} hechos</span></h2>
        <ol>
          {#each node.actions as action, i (action)}
            <li class:hecho={node.stepsDone?.includes(i)}>
              <label>
                <input type="checkbox" checked={node.stepsDone?.includes(i) ?? false} onchange={() => toggleStep(node, i)} />
                <span class="num">{i + 1}</span>
                <span>{action}</span>
              </label>
            </li>
          {/each}
        </ol>
      </section>
    {/if}

    {#if done >= 2 && node.params.length}
      <section class="params-block" aria-labelledby="params-title">
        <h2 id="params-title">Datos de cuidado</h2>
        <div class="params">
          {#each node.params as p, i (p.label)}
            {@const ParamIcon = paramIcon(p.label)}
            {@const options = paramOptions(p)}
            <div class="param" class:has-note={p.note} class:changed={canUndo(`dato:${p.label}`)}>
              <span class="k"><ParamIcon size={12} /> {p.label}</span>
              <strong class="v">{p.value}</strong>
              {#if options.length}
                <details class="more param-more">
                  <summary class="btn tiny ghost more-toggle"><CircleQuestionMark size={12} /> Preguntar <ChevronDown class="chevron" size={12} /></summary>
                  <div class="more-menu">
                    {#each options as o (o.id)}
                      <button class="btn tiny ghost" onclick={(e) => { closeMenu(e); adjust(node, `dato:${p.label}`, () => applyParamOption(node, i, o.id)); }}>{o.label}</button>
                    {/each}
                  </div>
                </details>
              {/if}
              {#if p.note}
                <p class="param-note">
                  {p.note}
                  {#if canUndo(`dato:${p.label}`)}<button class="link" onclick={() => undoAdjust(node)}>Deshacer</button>{/if}
                </p>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/if}

    {#if done >= 3 && node.sections.length}
      <section class="sections">
        {#if parentNode && parentDiff.length}
          <details class="section">
            <summary>
              <span class="section-title">Qué cambió desde «{parentNode.title}»</span>
              <span class="section-cue">
                <span class="cue-closed">Comparar</span>
                <span class="cue-open">Ocultar</span>
                <ChevronDown class="chevron" size={15} />
              </span>
            </summary>
            <p class="body">
              {parentDiff.join(' · ')}.
              <button class="link" onclick={() => openNode(parentNode.id)}>Abrir original</button>
            </p>
          </details>
        {/if}
        {#each node.sections as s, i (s.title + i)}
          <details class="section">
            <summary>
              <span class="section-title">{s.title}</span>
              <span class="section-cue">
                <span class="cue-closed">Ver detalles</span>
                <span class="cue-open">Ocultar</span>
                <ChevronDown class="chevron" size={15} />
              </span>
            </summary>
            {#if ideas(s.body).length > 1}
              <ul class="body">{#each ideas(s.body) as item (item)}<li>{item}</li>{/each}</ul>
            {:else}
              <p class="body">{s.body}</p>
            {/if}
          </details>
        {/each}
      </section>
    {/if}

    <Contexto {node} />

    <footer class="provenance">
      <div class="prov-actions">
        <button class="link" onclick={() => openLedger('lamina')}><MessagesSquare size={13} /> Ver las tres voces</button>
        <button class="link" onclick={() => reformulate(node)}><RefreshCw size={13} /> Editar mi pregunta</button>
        {#if Object.keys(node.replaced).length}
          <button class="link" onclick={() => restoreTerms(node)}><Undo2 size={13} /> Restaurar términos</button>
        {/if}
      </div>
    </footer>
  </article>
{/if}
