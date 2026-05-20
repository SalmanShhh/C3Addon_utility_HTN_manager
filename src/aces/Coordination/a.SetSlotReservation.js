export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Set Slot Reservation",
  displayText: "{0} slot {3} of type {2} in squad {1} for agent {4} ttl {5}",
  description: "Combined reserve/release slot action. Use case: simplify event sheets while keeping full slot control.",
  params: [
    {
      id: "mode",
      name: "Mode",
      desc: "Reserve or release operation.",
      type: "combo",
      initialValue: "reserve",
      items: [
        { reserve: "Reserve" },
        { release: "Release" },
      ],
    },
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Category like cover or flank.", type: "string", initialValue: '"cover"' },
    { id: "slotId", name: "Slot ID", desc: "Slot identifier.", type: "string", initialValue: '"node_1"' },
    { id: "agentUID", name: "Agent UID", desc: "Used when mode is Reserve.", type: "number", initialValue: "0" },
    { id: "ttlSec", name: "TTL (sec)", desc: "Used when mode is Reserve.", type: "number", initialValue: "1" },
  ],
};

export const expose = true;

export default function (mode, squadId, slotType, slotId, agentUID, ttlSec) {
  return this._setSlotReservation(mode, squadId, slotType, slotId, agentUID, ttlSec);
}