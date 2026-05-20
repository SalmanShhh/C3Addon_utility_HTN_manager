export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Performance: Set Enabled",
  displayText: "Set manager enabled to {0}",
  description: "Turns processing on or off. Use case: disable AI while game menus are open.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "True to process planning, false to skip updates.",
      type: "boolean",
      initialValue: "true",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this._setEnabled(enabled);
}