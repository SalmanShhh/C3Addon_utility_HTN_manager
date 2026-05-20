export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "Is Squad Leader",
  displayText: "Is agent {0} squad leader",
  description: "Checks leader status in current squad. Use case: leader-only tactic writes.",
  isInvertible: true,
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Agent to test.", type: "number", initialValue: "0" },
  ],
};

export const expose = false;

export default function (agentUID) {
  return this._isSquadLeader(agentUID);
}