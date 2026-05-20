export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Gets assigned slot ID for an agent and slot type. Use case: drive movement to assigned cover node.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Agent to query.", type: "number" },
    { id: "slotType", name: "Slot Type", desc: "Category like cover.", type: "string" },
  ],
};

export const expose = true;

export default function (agentUID, slotType) {
  return this._getAssignedSlotId(agentUID, slotType);
}