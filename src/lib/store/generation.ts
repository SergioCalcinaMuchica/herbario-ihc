import type { Branch, Brief, Candidate, Card, KnowledgeNode, Session } from "../types";
import { detectBrief } from "../brief";
import { card, node, uid } from "../data/factory";
import { buildStressSession, buildTreeDemoSession } from "../data/demos";
import { mergeGenerated, promptSpecies, titleFor } from "../engine/context";
import { buildContent, type Generated } from "../engine/generator";
import { app, setGenTimer, stopGeneration, stopTimer, streamingNode, toast } from "./state.svelte";
import { activeBranch, activeNode, branchOf, openNode, switchSession } from "./queries";
import { touch } from "./cards";

function applyGenerated(node: KnowledgeNode, content: Generated) {
  const hadContent = Boolean(node.esencia);
  const prevVersion = node.version;
  const prevActions = node.actions.length;
  const prevEsencia = node.esencia;

  node.esencia = content.esencia;
  node.terms = content.terms;
  node.actions = content.actions;
  node.params = content.params;
  node.sections = content.sections;
  node.candidates = content.candidates;
  node.milestones = content.milestones;
  node.species = content.species || node.species;
  node.cards = mergeGenerated(node.cards, content.cards);
  node.status = "lista";
  node.staleReason = undefined;
  if (hadContent) {
    const parts: string[] = [`v${prevVersion} → v${prevVersion + 1}`];
    if (prevEsencia !== content.esencia) parts.push("síntesis actualizada");
    if (prevActions !== content.actions.length) {
      parts.push(`${prevActions} → ${content.actions.length} pasos`);
    }
    node.changeNote = parts.join(" · ");
  }
  node.done = node.milestones.length;
  touch(node);
}

export function regenerate(node: KnowledgeNode) {
  const branch = branchOf(node);
  if (!branch) return;
  node.status = "generando";
  node.done = 0;
  applyGenerated(
    node,
    buildContent(node.prompt || node.title, branch, node.brief),
  );
  node.status = "generando";
  node.done = 0;
  startStreaming(node);
  toast("Generando otra versión");
}

export function recalc(node: KnowledgeNode) {
  const branch = branchOf(node);
  if (!branch) return;
  applyGenerated(
    node,
    buildContent(node.prompt || node.title, branch, node.brief),
  );
  toast("Respuesta actualizada");
}

export function reformulate(node: KnowledgeNode) {
  stopGeneration();
  app.composer = node.prompt;
  app.brief = { ...(node.brief ?? {}) };
  app.forkFromId = node.id;
  app.activeNodeId = "";
  app.branchTarget = "new";
  app.newBranchName = "";
  app.assumptionEdits = {};
  app.assumptionOff = {};
  app.leftOpen = false;
  app.rightOpen = false;
  toast(
    "Pregunta copiada. Al enviarla se abre una conversación nueva y la original no cambia.",
  );
}

/* ---------- generación simulada ---------- */

export function resume(node: KnowledgeNode) {
  if (node.status !== "borrador") return;
  startStreaming(node);
  toast("Reanudando desde el corte");
}

export function discardDraft(node: KnowledgeNode) {
  stopTimer();
  const branch = branchOf(node);
  if (!branch) return;
  const index = branch.nodes.findIndex((n) => n.id === node.id);
  branch.nodes = branch.nodes.filter((n) => n.id !== node.id);
  if (!app.composer) app.composer = node.prompt || node.title;
  const neighbour =
    branch.nodes[Math.min(Math.max(index - 1, 0), branch.nodes.length - 1)];
  app.activeNodeId = neighbour?.id ?? "";
  app.branchTarget = neighbour ? "active" : "new";
  toast("Borrador descartado. Tu pregunta sigue en la caja de escritura.");
}

export function newConsultation() {
  stopGeneration();
  app.activeNodeId = "";
  app.forkFromId = "";
  app.composer = "";
  app.brief = {};
  app.branchTarget = "new";
  app.newBranchName = "";
  app.assumptionEdits = {};
  app.assumptionOff = {};
  app.leftOpen = false;
  app.rightOpen = false;
}

export function chooseCandidate(c: Candidate) {
  const parent = activeNode();
  const constraints =
    parent?.cards.filter((x) => x.type === "preferencia").map((x) => x.text) ??
    [];
  let branch = app.session.branches.find((b) => b.species === c.scientific);
  if (!branch) {
    app.session.branches.push({
      id: uid("b"),
      name: c.name,
      species: c.scientific,
      closed: false,
      nodes: [],
    });
    branch = app.session.branches[app.session.branches.length - 1];
  }
  branch.closed = false;
  const n = node({
    id: uid("n"),
    branchId: branch.id,
    parentId: parent?.id,
    title: `Cuidar ${c.name}`,
    species: c.scientific,
    prompt: `Elegiste ${c.name}. ¿Cómo la cuido en casa?`,
    esencia: `${c.name} encaja porque ${c.fit.toLowerCase()}. La clave: ${c.needs.toLowerCase()}.`,
    actions: [
      `Luz: ${c.light.toLowerCase()}`,
      `Riego: ${c.water.toLowerCase()}`,
      "Comprueba el drenaje antes de regar",
    ],
    params: [
      { label: "Luz", value: c.light },
      { label: "Agua", value: c.water },
      { label: "Tamaño", value: c.size },
      { label: "Dificultad", value: "●".repeat(c.difficulty) },
    ],
    sections: [
      { title: "Por qué encaja", body: `${c.fit}. ${c.needs}.` },
      {
        title: "Qué vigilar",
        body:
          c.pets === "toxica"
            ? "Manténla fuera del alcance de gatos y perros."
            : "Revisa las hojas nuevas y el drenaje cada semana.",
      },
    ],
    cards: [
      card("hecho", `Elegiste ${c.name} (${c.scientific})`, {
        scope: "hilo",
        source: "usuario",
      }),
      ...(constraints.length
        ? [
            card(
              "preferencia",
              `La elección debía cumplir: ${constraints.join(" · ")}`,
              { scope: "hilo", source: "usuario" },
            ),
          ]
        : []),
      card("supuesto", "La maceta tiene orificio de drenaje", {
        confidence: "alta",
        scope: "hilo",
        detail: "Confírmalo antes de dar por hecho el drenaje.",
      }),
    ],
    status: "lista",
    pinned: true,
    done: 3,
  });
  branch.nodes.push(n);
  app.activeNodeId = n.id;
  app.forkFromId = "";
  app.branchTarget = "active";
  app.newBranchName = "";
  app.leftOpen = false;
  app.rightOpen = false;
  toast(`${c.name} elegida: conversación nueva creada`);
}

export function branchSuggestion(input: string): string {
  return titleFor(input);
}

export function send(
  assumptions: { text: string; detail?: string }[] = [],
  opts: { newSpecies?: string } = {},
): boolean {
  const text = app.composer.trim();
  if (!text) return false;
  if (streamingNode()) {
    stopGeneration();
    toast("Detén primero: revisa el borrador o empieza otra consulta.");
    return false;
  }

  const named = promptSpecies(text);
  const parent = activeNode();
  let branch = activeBranch();
  const wantsNew = app.branchTarget === "new" || !branch;
  const parentId = opts.newSpecies
    ? undefined
    : app.forkFromId || (!wantsNew ? parent?.id : undefined);

  if (opts.newSpecies) {
    branch =
      app.session.branches.find((b) => b.species === opts.newSpecies) ??
      undefined;
    if (!branch) {
      branch = {
        id: uid("b"),
        name: opts.newSpecies.split(" ")[0],
        species: opts.newSpecies,
        closed: false,
        nodes: [],
      };
      app.session.branches.push(branch);
    }
    branch.closed = false;
  } else if (
    !wantsNew &&
    branch?.species &&
    branch.species !== "Selección" &&
    named &&
    named !== branch.species
  ) {
    toast(
      `Estás en ${branch.species}. Abre una conversación de ${named} para no mezclar contextos.`,
    );
    return false;
  }

  if (wantsNew && !opts.newSpecies) {
    const name =
      app.newBranchName.trim() ||
      (named ? named.split(" ")[0] : "Nueva planta");
    branch = {
      id: uid("b"),
      name,
      species: named ?? "",
      closed: false,
      nodes: [],
    };
    app.session.branches.push(branch);
    branch = app.session.branches[app.session.branches.length - 1];
  } else if (branch?.closed) {
    toast("Esa conversación está cerrada. Reábrela o crea una nueva.");
    return false;
  }
  if (!branch) return false;

  const brief: Brief = { ...detectBrief(text), ...app.brief };
  const content = buildContent(text, branch, brief);
  if (!branch.species && content.species) branch.species = content.species;
  const nodeTitle = content.candidates?.length
    ? "Tres opciones para elegir"
    : titleFor(text, brief);
  const pre = assumptions.slice(0, 3).map((a) =>
    card("supuesto", a.text, {
      phase: "entrada",
      confidence: "media",
      detail:
        a.detail ??
        "Leído antes de generar. Si es falso, corrígelo: las láminas dependientes quedarán desactualizadas.",
    }),
  );
  const n = node({
    id: uid("n"),
    branchId: branch.id,
    parentId,
    title: nodeTitle,
    species: content.species,
    date: new Date().toISOString().slice(0, 10),
    prompt: text,
    esencia: content.esencia,
    terms: content.terms,
    actions: content.actions,
    params: content.params,
    sections: content.sections,
    cards: mergeGenerated(pre, content.cards),
    candidates: content.candidates,
    brief: { ...brief },
    status: "generando",
    milestones: content.milestones,
    done: 0,
    generatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
  });
  branch.nodes.push(n);
  app.activeNodeId = n.id;
  app.forkFromId = "";
  app.branchTarget = "active";
  app.newBranchName = "";
  app.composer = "";
  app.brief = {};
  app.assumptionEdits = {};
  app.assumptionOff = {};
  app.rightOpen = false;
  startStreaming(branch.nodes[branch.nodes.length - 1]);
  return true;
}

function startStreaming(nodeToStream: KnowledgeNode) {
  stopTimer();
  if (!nodeToStream.milestones.length) {
    nodeToStream.milestones = ["Diagnóstico", "Acciones", "Parámetros"];
  }
  // La respuesta ya está visible: el primer hito (diagnóstico) está cumplido.
  if (nodeToStream.esencia && nodeToStream.done === 0) nodeToStream.done = 1;
  nodeToStream.status = "generando";
  setGenTimer(setInterval(() => {
    nodeToStream.done += 1;
    if (nodeToStream.done >= nodeToStream.milestones.length) {
      nodeToStream.status = "lista";
      stopTimer();
      toast("Respuesta completa");
    }
  }, 900));
}



export function loadStressCase() {
  stopTimer();
  app.sessions = [buildStressSession()];
  app.sessionId = "stress";
  app.session = app.sessions[0];
  app.activeNodeId = "st-3-12";
  app.forkFromId = "";
  app.mode = "sesiones";
  app.mapZoom = "lejos";
  app.stress = true;
  app.leftOpen = false;
  app.rightOpen = false;
  toast("Caso de estrés: 200 respuestas y 3.400 notas");
}

export function loadTreeDemo() {
  stopTimer();
  const existing = app.sessions.find((s) => s.id === "tree-demo");
  if (!existing) {
    app.sessions.push(buildTreeDemoSession());
  }
  switchSession("tree-demo", "td-b2b1a");
  app.stress = false;
  app.mapOpen = true;
  toast("Ejemplo de árbol cargado: 35 consultas");
}
