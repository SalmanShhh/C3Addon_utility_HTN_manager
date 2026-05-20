export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Reserve Slot",
  displayText: "Reserve slot {2} of type {1} in squad {0} for agent {3} for {4} sec",
  description: "Reserves a squad slot with TTL. Use case: allocate unique cover nodes to avoid overlap.",
  params: [
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Category like cover or flank.", type: "string", initialValue: '"cover"' },
    { id: "slotId", name: "Slot ID", desc: "Slot identifier.", type: "string", initialValue: '"node_1"' },
    { id: "agentUID", name: "Agent UID", desc: "Agent claiming slot.", type: "number", initialValue: "0" },
    { id: "ttlSec", name: "TTL (sec)", desc: "Reservation lifetime in seconds.", type: "number", initialValue: "1" },
  ],
};

export const expose = true;

export default function (squadId, slotType, slotId, agentUID, ttlSec) {
  return this._reserveSlot(squadId, slotType, slotId, agentUID, ttlSec);
}