import type { Brief, CardType, KnowledgeNode, Session } from "../types";
import { demoBranches } from "../demo-tasks";
import { advanceUid } from "../data/factory";
import { seed } from "../data/seed";

export const app = $state({
  sessions: [seed] as Session[],
  sessionId: "s1",
  session: seed,
  activeNodeId: "demo-comprar-1",
  forkFromId: "",
  mode: "sesiones" as "sesiones" | "biblioteca",
  registry: "divulgativo" as "llano" | "divulgativo" | "experto",
  composer: "",
  brief: {} as Brief,
  branchTarget: "active" as "active" | "new",
  newBranchName: "",
  assumptionEdits: {} as Record<string, string>,
  assumptionOff: {} as Record<string, boolean>,
  searchOpen: false,
  searchQuery: "",
  searchType: null as CardType | null,
  searchSpecies: null as string | null,
  searchOnlyUnconfirmed: false,
  searchScope: "sesion" as "sesion" | "todas",
  ledgerOpen: false,
  ledgerTab: "lamina" as "lamina" | "sesion" | "heredado",
  ledgerLimit: 30,
  mapOpen: false,
  mapZoom: "medio" as "lejos" | "medio" | "cerca",
  mapQuery: "",
  leftOpen: false,
  rightOpen: false,
  stress: false,
  toast: "",
});

// Una sola fuente para la sesión activa: evita dos proxies del mismo objeto.
app.sessions = [app.session];

/** Añade las tres consultas de ejemplo a una sesión ya guardada, una sola vez. */
export function ensureDemoTasks() {
  const existing = new Set(app.session.branches.map((branch) => branch.id));
  const missing = demoBranches.filter((branch) => !existing.has(branch.id));
  if (!missing.length) return false;
  app.session.branches.unshift(...structuredClone(missing));
  return true;
}

/**
 * Al recargar, el contador de ids vuelve a empezar y puede repetir uno guardado
 * (`n23`, `b17`...). Lo adelanta por encima del mayor id existente.
 */
export function syncIdSequence() {
  let max = 0;
  const scan = (id: string | undefined) => {
    const match = id?.match(/^[a-z]+(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  };

  for (const session of app.sessions) {
    scan(session.id);
    for (const branch of session.branches) {
      scan(branch.id);
      for (const node of branch.nodes) {
        scan(node.id);
        for (const card of node.cards) scan(card.id);
      }
    }
  }

  advanceUid(max + 1);
}
let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function toast(message: string) {
  app.toast = message;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    app.toast = "";
  }, 2600);
}

let genTimer: ReturnType<typeof setInterval> | null = null;

export function setGenTimer(next: ReturnType<typeof setInterval> | null) {
  genTimer = next;
}

export function stopTimer() {
  if (genTimer) clearInterval(genTimer);
  genTimer = null;
}

export function streamingNode(): KnowledgeNode | undefined {
  return app.session.branches
    .flatMap((b) => b.nodes)
    .find((n) => n.status === "generando");
}

export function stopGeneration() {
  const n = streamingNode();
  stopTimer();
  if (!n) return;
  n.status = "borrador";
  toast(
    n.done === 0
      ? "Detenido antes del primer hito. Nada se borró."
      : "Detenido. Lo parcial queda como borrador.",
  );
}
