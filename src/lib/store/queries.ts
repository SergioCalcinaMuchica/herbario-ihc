import type { Branch, Card, KnowledgeNode, Session } from "../types";
import { uid } from "../data/factory";
import { app, stopGeneration, toast } from "./state.svelte";

export function allNodes(): KnowledgeNode[] {
  return app.session.branches.flatMap((b) => b.nodes);
}

export function allNodesEverywhere(): KnowledgeNode[] {
  return app.sessions.flatMap((s) => s.branches.flatMap((b) => b.nodes));
}

export function sessionOfNode(
  node: KnowledgeNode | undefined,
): Session | undefined {
  if (!node) return undefined;
  return app.sessions.find((s) =>
    s.branches.some((b) => b.nodes.some((n) => n.id === node.id)),
  );
}

export function switchSession(id: string, nodeId = "") {
  const next = app.sessions.find((s) => s.id === id);
  if (!next) return;
  stopGeneration();
  app.sessionId = next.id;
  app.session = next;
  const first = nodeId || next.branches.flatMap((b) => b.nodes)[0]?.id || "";
  app.activeNodeId = first;
  app.forkFromId = "";
  app.branchTarget = first ? "active" : "new";
  app.mapOpen = false;
  app.searchOpen = false;
  app.ledgerOpen = false;
  app.leftOpen = false;
  app.rightOpen = false;
}

export function createSession(title: string) {
  const name = title.trim();
  if (!name) return;
  const session: Session = { id: uid("ses"), title: name, branches: [] };
  app.sessions.push(session);
  switchSession(session.id);
  toast(`Cuaderno «${name}» creado`);
}

export function branchOf(node: KnowledgeNode | undefined): Branch | undefined {
  if (!node) return undefined;
  return app.session.branches.find((b) => b.id === node.branchId);
}

export function activeNode(): KnowledgeNode | undefined {
  return allNodes().find((n) => n.id === app.activeNodeId);
}

export function activeBranch(): Branch | undefined {
  return branchOf(activeNode());
}

export function childrenOf(node: KnowledgeNode | undefined): KnowledgeNode[] {
  if (!node) return [];
  return allNodes().filter((n) => n.parentId === node.id);
}

export function lineCount(node: KnowledgeNode | undefined): number {
  return childrenOf(node).length;
}

/** Nodo del que nace una «Reformular» pendiente, si la hay. */
export function forkSource(): KnowledgeNode | undefined {
  return app.forkFromId
    ? allNodes().find((n) => n.id === app.forkFromId)
    : undefined;
}

export function unconfirmed(node: KnowledgeNode | undefined): Card[] {
  if (!node) return [];
  return node.cards.filter(
    (c) => c.type === "supuesto" && c.state === "sin_confirmar",
  );
}

export function globalCards(): Card[] {
  const seen = new Set<string>();
  return allNodesEverywhere()
    .flatMap((n) =>
      n.cards.filter(
        (c) =>
          c.scope !== "hilo" && c.type !== "supuesto" && c.state !== "ignorado",
      ),
    )
    .filter((c) => {
      const key = `${c.type}|${c.scope}|${c.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** Cartas nacidas en esta lámina, sin importar su ámbito. */
export function ownCards(node: KnowledgeNode | undefined): Card[] {
  return node ? node.cards : [];
}

/**
 * Cartas de otras láminas que sostienen esta: reglas y artefactos de especie
 * (misma especie) y globales. Nunca se llama «heredado» a lo propio.
 */
export function inheritedCards(node: KnowledgeNode | undefined): Card[] {
  if (!node) return [];
  const own = new Set(node.cards.map((c) => c.id));
  const seen = new Set<string>();
  const out: Card[] = [];
  for (const other of allNodesEverywhere()) {
    if (other.id === node.id) continue;
    for (const c of other.cards) {
      if (own.has(c.id)) continue;
      if (c.state === "ignorado") continue;
      if (c.scope === "hilo") continue;
      if (c.scope === "especie" && other.species !== node.species) continue;
      const key = `${c.type}|${c.scope}|${c.text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}

export function pinnedNodes(everywhere = false): KnowledgeNode[] {
  const nodes = everywhere ? allNodesEverywhere() : allNodes();
  return nodes.filter((n) => n.pinned);
}

export function openNode(id: string) {
  const found = allNodesEverywhere().find((n) => n.id === id);
  if (found) {
    const session = sessionOfNode(found);
    if (session && session.id !== app.sessionId) {
      app.sessionId = session.id;
      app.session = session;
    }
  }
  app.activeNodeId = id;
  app.forkFromId = "";
  app.branchTarget = "active";
  app.leftOpen = false;
  app.rightOpen = false;
  app.mapOpen = false;
  app.searchOpen = false;
}

export function openMap() {
  app.mapOpen = true;
  app.searchOpen = false;
  app.ledgerOpen = false;
}

export function openSearch() {
  app.searchOpen = true;
  app.mapOpen = false;
  app.ledgerOpen = false;
}

export function openLedger(tab: "lamina" | "sesion" | "heredado" = "lamina") {
  app.ledgerTab = tab;
  app.ledgerLimit = 30;
  app.ledgerOpen = true;
  app.mapOpen = false;
  app.searchOpen = false;
}

export function renameBranch(branch: Branch, name: string) {
  const clean = name.trim();
  if (!clean) return;
  branch.name = clean;
  toast("Conversación renombrada");
}

export function toggleBranchClosed(branch: Branch) {
  branch.closed = !branch.closed;
  toast(branch.closed ? "Conversación cerrada: se puede seguir buscando" : "Conversación reabierta");
}

export function togglePin(node: KnowledgeNode) {
  node.pinned = !node.pinned;
  toast(
    node.pinned
      ? "Respuesta fijada"
      : "Respuesta ya no está fijada",
  );
}


export function ownerOfCard(c: Card): KnowledgeNode | undefined {
  return allNodesEverywhere().find((n) => n.cards.some((x) => x.id === c.id));
}


export function speciesList(everywhere = false): string[] {
  const nodes = everywhere ? allNodesEverywhere() : allNodes();
  return [...new Set(nodes.map((n) => n.species).filter(Boolean))].sort();
}
