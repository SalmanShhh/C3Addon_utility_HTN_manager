export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Performance: Set Planning Interval",
  displayText: "Set planning interval to {0} seconds",
  description: "Sets time between planning passes in seconds for Interval mode. Beginner tip: try 0.1 first, then raise to 0.2 or 0.25 if you need more performance.",
  params: [
    {
      id: "seconds",
      name: "Seconds",
      desc: "Seconds between planning updates in interval mode.",
      type: "number",
      initialValue: "0.1",
    },
  ],
};

export const expose = true;

export default function (seconds) {
  this._setPlanningIntervalSec(seconds);
}