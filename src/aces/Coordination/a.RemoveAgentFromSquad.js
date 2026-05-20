export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Remove Agent From Squad",
  displayText: "Remove agent {0} from squad",
  description: "Removes one agent from its squad. Use case: cleanup when an NPC is defeated.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Agent to remove.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (agentUID) {
  return this._removeAgentFromSquad(agentUID);
}