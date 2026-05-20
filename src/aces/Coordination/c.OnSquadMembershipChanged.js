export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "On Squad Membership Changed",
  displayText: "On squad membership changed",
  description: "Triggered when an agent joins or leaves a squad. Use case: refresh squad HUD widgets.",
  isTrigger: true,
  isInvertible: false,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}