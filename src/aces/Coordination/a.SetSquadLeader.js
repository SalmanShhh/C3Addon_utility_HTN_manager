export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Set Squad Leader",
  displayText: "Set squad {0} leader to agent {1}",
  description: "Sets the leader agent for a squad. Use case: only leader chooses squad tactic.",
  params: [
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
    { id: "agentUID", name: "Agent UID", desc: "Leader agent UID.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (squadId, agentUID) {
  return this._setSquadLeader(squadId, agentUID);
}