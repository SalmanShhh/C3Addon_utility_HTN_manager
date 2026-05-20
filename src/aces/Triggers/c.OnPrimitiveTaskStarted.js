export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "On Primitive Task Started",
  displayText: "On primitive task started",
  description: "Triggered when a primitive task begins. Use case: play movement or attack events for that task ID.",
  isTrigger: true,
  isInvertible: false,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}