export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Squad Plan Control",
  displayText: "{0} plans for squad {1}",
  description: "Combined invalidate/request squad planning action. Use case: choose delayed or immediate squad replan with one ACE.",
  params: [
    {
      id: "mode",
      name: "Mode",
      desc: "Invalidate for next update or request now.",
      type: "combo",
      initialValue: "invalidate",
      items: [
        { invalidate: "Invalidate" },
        { request: "Request Now" },
      ],
    },
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
  ],
};

export const expose = true;

export default function (mode, squadId) {
  return this._squadPlanControl(mode, squadId);
}