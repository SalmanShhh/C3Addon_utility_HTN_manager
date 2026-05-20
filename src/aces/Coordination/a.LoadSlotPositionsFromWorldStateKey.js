export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Load Slot Positions From World State Key",
  displayText: "Load slot positions for squad {0} type {1} from {2} key {3} agent {4}",
  description: "Loads slot positions from a world-state key. Use case: share dynamic slot maps through state data.",
  params: [
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Category like cover or flank.", type: "string", initialValue: '"cover"' },
    {
      id: "scope",
      name: "Scope",
      desc: "Read from global state or an agent state.",
      type: "combo",
      initialValue: "global",
      items: [
        { global: "Global" },
        { agent: "Agent" },
      ],
    },
    { id: "key", name: "Key", desc: "State key containing JSON/array slot data.", type: "string", initialValue: '"coverSlots"' },
    { id: "agentUID", name: "Agent UID", desc: "Used when scope is Agent.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (squadId, slotType, scope, key, agentUID) {
  return this._loadSlotPositionsFromWorldStateKey(squadId, slotType, scope, key, agentUID);
}