export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "On Stimulus Received",
  displayText: "On stimulus received",
  description: "Triggered when any stimulus is added. Use case: spawn investigation markers at stimulus coordinates.",
  isTrigger: true,
  isInvertible: false,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}