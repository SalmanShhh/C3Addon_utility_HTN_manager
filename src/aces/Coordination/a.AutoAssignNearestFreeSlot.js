export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Auto Assign Nearest Free Slot",
  displayText: "Auto assign nearest free {2} slot in squad {1} to agent {0} from {3}, {4} max {5} ttl {6}",
  description: "Finds nearest free slot and reserves it. Use case: auto-pick closest cover for each squad member.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Agent to assign.", type: "number", initialValue: "0" },
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Category like cover or flank.", type: "string", initialValue: '"cover"' },
    { id: "agentX", name: "Agent X", desc: "Agent world X used for distance.", type: "number", initialValue: "0" },
    { id: "agentY", name: "Agent Y", desc: "Agent world Y used for distance.", type: "number", initialValue: "0" },
    { id: "maxDistance", name: "Max Distance", desc: "0 means no distance limit.", type: "number", initialValue: "0" },
    { id: "ttlSec", name: "TTL (sec)", desc: "Reservation lifetime.", type: "number", initialValue: "1" },
  ],
};

export const expose = true;

export default function (
  agentUID,
  squadId,
  slotType,
  agentX,
  agentY,
  maxDistance,
  ttlSec
) {
  return this._autoAssignNearestFreeSlot(
    agentUID,
    squadId,
    slotType,
    agentX,
    agentY,
    maxDistance,
    ttlSec
  );
}