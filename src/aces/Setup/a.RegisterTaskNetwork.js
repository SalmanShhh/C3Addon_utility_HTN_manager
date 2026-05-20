export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Setup: Register Task Network",
  displayText: "Register task network for {0} from {1}",
  description: "Loads a task tree from JSON for one agent type. Use case: register guard AI at layout start.",
  params: [
    {
      id: "agentType",
      name: "Agent type",
      desc: "Agent type string used to look up the network.",
      type: "string",
      initialValue: '""',
    },
    {
      id: "networkJson",
      name: "Network JSON",
      desc: "HTN task network definition as JSON.",
      type: "string",
      initialValue: '"{}"',
    },
  ],
};

export const expose = true;

export default function (agentType, networkJson) {
  return this._registerTaskNetwork(agentType, networkJson);
}