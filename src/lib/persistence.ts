import type { KnowledgeNode, Session } from './types';
import { app, ensureDemoTasks, syncIdSequence } from './store.svelte';

export const STORAGE_KEY = 'herbario:v2';
export const DEMO_TASKS_KEY = 'herbario:demoTasks:v1';

interface PersistedState {
  sessions?: Session[];
  sessionId?: string;
  activeNodeId?: string;
}

/** Normaliza nodos recuperados de almacenamiento tras una recarga o versión previa. */
function normalizeNode(node: KnowledgeNode) {
  // Un estado «generando» guardado no tiene temporizador al recargar:
  // se recupera como borrador para que no quede un Detener fantasma.
  if (node.status === 'generando') {
    node.status = node.done >= node.milestones.length ? 'lista' : 'borrador';
  }
  // Láminas antiguas pueden tener dos secciones con el mismo título.
  const sections = new Map<string, { title: string; body: string }>();
  for (const section of node.sections) {
    const already = sections.get(section.title);
    if (already) already.body = `${already.body} ${section.body}`;
    else sections.set(section.title, { ...section });
  }
  node.sections = [...sections.values()];
}

/** Hidrata el estado global desde localStorage y sincroniza las tareas demo. */
export function hydrateAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as PersistedState;
      if (data.sessions?.length) {
        app.sessions = data.sessions;
        for (const session of app.sessions) {
          for (const branch of session.branches) {
            for (const node of branch.nodes) normalizeNode(node);
          }
        }
        const session = app.sessions.find((s) => s.id === data.sessionId) ?? app.sessions[0];
        app.session = session;
        app.sessionId = session.id;
        const first = session.branches.flatMap((b) => b.nodes)[0]?.id ?? '';
        const savedNode = session.branches.flatMap((b) => b.nodes).find((n) => n.id === data.activeNodeId);
        app.activeNodeId = savedNode?.id ?? first;
        app.branchTarget = app.activeNodeId ? 'active' : 'new';
      }
    }
    // Las tres consultas de ejemplo se añaden una vez a sesiones ya guardadas.
    // El flag evita que reaparezcan si el usuario las borra.
    if (!localStorage.getItem(DEMO_TASKS_KEY)) {
      ensureDemoTasks();
      localStorage.setItem(DEMO_TASKS_KEY, '1');
    }
    syncIdSequence();
  } catch {
    /* localStorage corrupto o no disponible: se usa la semilla */
  }
}

/** Serializa el estado actual para guardarlo en localStorage. */
export function serializeAppState(): string {
  return JSON.stringify({
    sessions: app.sessions,
    sessionId: app.sessionId,
    activeNodeId: app.activeNodeId
  });
}

/** Persiste el estado serializado en localStorage. Devuelve false si falla la cuota. */
export function saveAppState(serialized: string): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch {
    return false;
  }
}
