import {
  ADDON_CATEGORY,
  ADDON_TYPE,
  PLUGIN_TYPE,
  PROPERTY_TYPE,
} from "./template/enums.js";
import _version from "./version.js";
export const addonType = ADDON_TYPE.PLUGIN;
export const type = PLUGIN_TYPE.OBJECT;
export const id = "salmanshh_DHTN_manager";
export const name = "Utility-Driven HTN (Hierarchical Task Network) Manager";
export const version = _version;
export const minConstructVersion = undefined;
export const author = "SalmanShh";
export const website = "https://www.construct.net";
export const documentation = "https://www.construct.net";
export const description = "Utility-driven HTN planning manager with scorer-based branch selection.";
export const category = ADDON_CATEGORY.GENERAL;

export const hasDomside = false;
export const files = {
  extensionScript: {
    enabled: false, // set to false to disable the extension script
    watch: true, // set to true to enable live reload on changes during development
    targets: ["x86", "x64"],
    // you don't need to change this, the build step will rename the dll for you. Only change this if you change the name of the dll exported by Visual Studio
    name: "MyExtension",
  },
  fileDependencies: [],
  remoteFileDependencies: [
    // {
    //   src: "https://example.com/api.js", // Must use https:// or same-protocol // URLs. http:// is not allowed.
    //   type: "" // Optional: "" or "module". Empty string or omit for classic script.
    // }
  ],
  cordovaPluginReferences: [],
  cordovaResourceFiles: [],
};

// categories that are not filled will use the folder name
export const aceCategories = {
  Coordination: "Coordination",
  Performance: "Performance",
  Setup: "Setup",
  Planning: "Planning",
  Alert: "Alert",
  Debug: "Debug",
  Triggers: "Triggers",
  State: "State",
  Queries: "Queries",
  Registry: "Registry",
};

export const info = {
  // icon: "icon.svg",
  // PLUGIN world only
  // defaultImageUrl: "default-image.png",
  Set: {
    // COMMON to all
    CanBeBundled: true,
    IsDeprecated: false,
    GooglePlayServicesEnabled: false,

    // BEHAVIOR only
    IsOnlyOneAllowed: false,

    // PLUGIN world only
    IsResizable: false,
    IsRotatable: false,
    Is3D: false,
    HasImage: false,
    IsTiled: false,
    SupportsZElevation: false,
    SupportsColor: false,
    SupportsEffects: false,
    MustPreDraw: false,

    // PLUGIN object only
    IsSingleGlobal: true,
  },
  // PLUGIN only
  AddCommonACEs: {
    Position: false,
    SceneGraph: false,
    Size: false,
    Angle: false,
    Appearance: false,
    ZOrder: false,
  },
};

export const properties = [
  {
    type: PROPERTY_TYPE.CHECK,
    id: "enabled",
    name: "Enabled",
    desc: "Turn planner processing on or off. Use case: disable AI during pause menus.",
    options: {
      initialValue: true,
    },
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id: "debugMode",
    name: "Debug mode",
    desc: "Show debug logs in the console. Use case: inspect why an agent picked a task.",
    options: {
      initialValue: false,
    },
  },
  {
    type: PROPERTY_TYPE.COMBO,
    id: "planningMode",
    name: "Planning mode",
    desc: "Choose how often planning runs. Start with Per frame for simple projects; switch to Interval when many agents are active to reduce CPU usage.",
    options: {
      initialValue: "per_frame",
      items: [
        { per_frame: "Per frame" },
        { interval_sec: "Interval (seconds)" },
      ],
    },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "planningIntervalSec",
    name: "Planning interval (sec)",
    desc: "Time between planning updates when Planning mode is Interval. Example: 0.2 means one planning pass every 0.2 seconds (5 times per second).",
    options: {
      initialValue: 0.1,
      minValue: 0.01,
    },
  },
  {
    type: PROPERTY_TYPE.INTEGER,
    id: "maxAgentsPerTick",
    name: "Max agents per update",
    desc: "How many agents to evaluate each update; 0 means all. Use case: cap spikes in large crowds.",
    options: {
      initialValue: 0,
      minValue: 0,
    },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "planningTimeSliceSec",
    name: "Planning time slice (sec)",
    desc: "Maximum time allowed for planning work in one update. 0 disables this limit. Example: 0.002 gives planning about 2 ms per update to keep frames smooth.",
    options: {
      initialValue: 0,
      minValue: 0,
    },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "interruptThreshold",
    name: "Interrupt threshold",
    desc: "Minimum utility score needed to interrupt a running task. Use case: reduce rapid plan swapping.",
    options: {
      initialValue: 0.75,
      minValue: 0,
      maxValue: 1,
    },
  },
  {
    type: PROPERTY_TYPE.INTEGER,
    id: "maxPlanDepth",
    name: "Max plan depth",
    desc: "Stops very deep or looping plans. Use case: catch broken network JSON safely.",
    options: {
      initialValue: 20,
      minValue: 1,
    },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "alertDecayRate",
    name: "Alert decay rate",
    desc: "Alert drop per second with no stimulus. Use case: enemies calm down over time.",
    options: {
      initialValue: 0.05,
      minValue: 0,
    },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "alertTier1Threshold",
    name: "Alert tier 1",
    desc: "Level where agent becomes suspicious. Use case: tune early warning behavior.",
    options: {
      initialValue: 0.25,
      minValue: 0,
      maxValue: 1,
    },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "alertTier2Threshold",
    name: "Alert tier 2",
    desc: "Level where agent becomes alerted. Use case: switch from patrol to search.",
    options: {
      initialValue: 0.55,
      minValue: 0,
      maxValue: 1,
    },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "alertTier3Threshold",
    name: "Alert tier 3",
    desc: "Level where agent enters combat. Use case: delay full aggression until threat is clear.",
    options: {
      initialValue: 0.8,
      minValue: 0,
      maxValue: 1,
    },
  },
];
