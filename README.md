<img src="./src/icon.svg" width="100" /><br>
# Utility-Driven HTN (Hierarchical Task Network) Manager
<i>Build smarter enemy and NPC AI with utility-driven HTN planning, alert reactions, and squad coordination, plus scalable time-sliced performance in addition to powerful behavior trees. This plugin provides a flexible framework for creating complex, data-driven AI behaviors in your games.</i> <br>
### Version 1.0.0.1

[<img src="https://placehold.co/200x50/4493f8/FFF?text=Download&font=montserrat" width="200"/>](https://github.com/SalmanShhh/C3Addon_utility_driven_htn_hierarchical_task_network_manager/releases/download/salmanshh_DHTN_manager-1.0.0.1.c3addon/salmanshh_DHTN_manager-1.0.0.1.c3addon)
<br>
<sub> [See all releases](https://github.com/SalmanShhh/C3Addon_utility_driven_htn_hierarchical_task_network_manager/releases) </sub> <br>

---
<b><u>Author:</u></b> SalmanShh <br>
<sub>Made using [CAW](https://marketplace.visualstudio.com/items?itemName=skymen.caw) </sub><br>

## Table of Contents
- [Usage](#usage)
- [Examples Files](#examples-files)
- [Properties](#properties)
- [Actions](#actions)
- [Conditions](#conditions)
- [Expressions](#expressions)
---
## Usage
To build the addon, run the following commands:

```
npm i
npm run build
```

To run the dev server, run

```
npm i
npm run dev
```

## Examples Files

---
## Properties
| Property Name | Description | Type |
| --- | --- | --- |
| Enabled | Turn planner processing on or off. Use case: disable AI during pause menus. | check |
| Debug mode | Show debug logs in the console. Use case: inspect why an agent picked a task. | check |
| Planning mode | Choose how often planning runs. Start with Per frame for simple projects; switch to Interval when many agents are active to reduce CPU usage. | combo |
| Planning interval (sec) | Time between planning updates when Planning mode is Interval. Example: 0.2 means one planning pass every 0.2 seconds (5 times per second). | float |
| Max agents per update | How many agents to evaluate each update; 0 means all. Use case: cap spikes in large crowds. | integer |
| Planning time slice (sec) | Maximum time allowed for planning work in one update. 0 disables this limit. Example: 0.002 gives planning about 2 ms per update to keep frames smooth. | float |
| Interrupt threshold | Minimum utility score needed to interrupt a running task. Use case: reduce rapid plan swapping. | float |
| Max plan depth | Stops very deep or looping plans. Use case: catch broken network JSON safely. | integer |
| Alert decay rate | Alert drop per second with no stimulus. Use case: enemies calm down over time. | float |
| Alert tier 1 | Level where agent becomes suspicious. Use case: tune early warning behavior. | float |
| Alert tier 2 | Level where agent becomes alerted. Use case: switch from patrol to search. | float |
| Alert tier 3 | Level where agent enters combat. Use case: delay full aggression until threat is clear. | float |


---
## Actions
| Action | Description | Params
| --- | --- | --- |
| Alert: Add Alert Stimulus | Adds a simple stimulus event. Use case: raise alert when a guard hears a noise. | Agent UID             *(number)* <br>Type             *(string)* <br>Intensity             *(number)* <br>X             *(number)* <br>Y             *(number)* <br> |
| Alert: Add Alert Stimulus Extended | Adds a detailed stimulus from JSON. Use case: set custom decay and update world state in one call. | Agent UID             *(number)* <br>Stimulus JSON             *(string)* <br> |
| Alert: Clear Stimuli | Removes current stored stimuli. Use case: reset sensory pressure after a scripted state change. | Agent UID             *(number)* <br> |
| Alert: Decay Alert | Lowers alert by a fixed amount. Use case: calm an agent after the player escapes. | Agent UID             *(number)* <br>Amount             *(number)* <br> |
| Alert: Set Alert Level | Sets alert level directly from 0 to 1. Use case: force combat mode when player is spotted. | Agent UID             *(number)* <br>Level             *(number)* <br> |
| Coordination: Assign Agent To Squad | Puts one agent in a squad. Use case: build patrol teams at layout start. | Agent UID             *(number)* <br>Squad ID             *(string)* <br> |
| Coordination: Auto Assign Nearest Free Slot | Finds nearest free slot and reserves it. Use case: auto-pick closest cover for each squad member. | Agent UID             *(number)* <br>Squad ID             *(string)* <br>Slot Type             *(string)* <br>Agent X             *(number)* <br>Agent Y             *(number)* <br>Max Distance             *(number)* <br>TTL (sec)             *(number)* <br> |
| Coordination: Clear Squad State Key | Removes one shared squad key. Use case: clear temporary rally point after regroup. | Squad ID             *(string)* <br>Key             *(string)* <br> |
| Coordination: Invalidate Squad Plans | Marks squad members stale for next planning update. Use case: tactic changed for full squad. | Squad ID             *(string)* <br> |
| Coordination: Load Slot Positions From JSON | Loads many slot positions from JSON array data. Use case: import a pre-authored cover map. | Squad ID             *(string)* <br>Slot Type             *(string)* <br>Slots JSON             *(string)* <br> |
| Coordination: Load Slot Positions From World State Key | Loads slot positions from a world-state key. Use case: share dynamic slot maps through state data. | Squad ID             *(string)* <br>Slot Type             *(string)* <br>Scope             *(combo)* <br>Key             *(string)* <br>Agent UID             *(number)* <br> |
| Coordination: Release Slot | Releases a reserved slot. Use case: free cover slot when an agent moves away. | Squad ID             *(string)* <br>Slot Type             *(string)* <br>Slot ID             *(string)* <br> |
| Coordination: Remove Agent From Squad | Removes one agent from its squad. Use case: cleanup when an NPC is defeated. | Agent UID             *(number)* <br> |
| Coordination: Request Squad Plans | Requests immediate planning for squad members. Use case: execute synced reaction now. | Squad ID             *(string)* <br> |
| Coordination: Reserve Slot | Reserves a squad slot with TTL. Use case: allocate unique cover nodes to avoid overlap. | Squad ID             *(string)* <br>Slot Type             *(string)* <br>Slot ID             *(string)* <br>Agent UID             *(number)* <br>TTL (sec)             *(number)* <br> |
| Coordination: Set Slot Position | Defines one slot position from event-sheet coordinates. Use case: set cover node positions at layout start. | Squad ID             *(string)* <br>Slot Type             *(string)* <br>Slot ID             *(string)* <br>X             *(number)* <br>Y             *(number)* <br> |
| Coordination: Set Slot Reservation | Combined reserve/release slot action. Use case: simplify event sheets while keeping full slot control. | Mode             *(combo)* <br>Squad ID             *(string)* <br>Slot Type             *(string)* <br>Slot ID             *(string)* <br>Agent UID             *(number)* <br>TTL (sec)             *(number)* <br> |
| Coordination: Set Squad Leader | Sets the leader agent for a squad. Use case: only leader chooses squad tactic. | Squad ID             *(string)* <br>Agent UID             *(number)* <br> |
| Coordination: Set Squad State Key | Writes shared squad state. Use case: set tactic to flank_left for all members. | Squad ID             *(string)* <br>Key             *(string)* <br>Value             *(any)* <br> |
| Coordination: Squad Plan Control | Combined invalidate/request squad planning action. Use case: choose delayed or immediate squad replan with one ACE. | Mode             *(combo)* <br>Squad ID             *(string)* <br> |
| Debug: Dump Agent State | Prints one agent snapshot in the console. Use case: quickly check world state and current plan. | Agent UID             *(number)* <br> |
| Debug: Set Debug Mode | Turns debug logging on or off. Use case: inspect planner decisions while testing. | Enabled             *(boolean)* <br> |
| Performance: Process Planning Now | Runs one planning pass immediately. Use case: apply state changes now instead of waiting. |  |
| Performance: Set Enabled | Turns processing on or off. Use case: disable AI while game menus are open. | Enabled             *(boolean)* <br> |
| Performance: Set Max Agents Per Update | Caps agents evaluated per update. Use case: smooth frame-time spikes with large NPC groups. | Count             *(number)* <br> |
| Performance: Set Planning Interval | Sets time between planning passes in seconds for Interval mode. Beginner tip: try 0.1 first, then raise to 0.2 or 0.25 if you need more performance. | Seconds             *(number)* <br> |
| Performance: Set Planning Mode | Switches how often planning runs. Beginner tip: use Per frame while learning, then switch to Interval if frame rate drops with many agents. | Mode             *(combo)* <br> |
| Performance: Set Planning Time Slice | Sets max planning time allowed per update in seconds. Beginner tip: start at 0 (off), then try 0.001-0.003 if big AI spikes cause frame drops. | Seconds             *(number)* <br> |
| Planning: Clear Plan | Removes remaining planned tasks. Use case: keep an agent idle until new orders arrive. | Agent UID             *(number)* <br> |
| Planning: Force Task | Forces one task to run first. Use case: trigger a scripted reaction during a cutscene. | Agent UID             *(number)* <br>Task ID             *(string)* <br> |
| Planning: Invalidate Plan | Marks a plan as outdated for next update. Use case: world changed but current task should finish. | Agent UID             *(number)* <br> |
| Planning: Pause Planning | Stops planning updates for one agent. Use case: freeze NPC AI while a dialogue plays. | Agent UID             *(number)* <br> |
| Planning: Request Plan | Builds a fresh plan right now. Use case: replan instantly after a major event. | Agent UID             *(number)* <br> |
| Planning: Resume Planning | Restarts planning for one agent. Use case: resume AI after a stun or cutscene. | Agent UID             *(number)* <br> |
| Setup: Clear World State Key | Removes one world-state key from an agent. Use case: clear last known target after search ends. | Agent UID             *(number)* <br>Key             *(string)* <br> |
| Setup: Register Task Network | Loads a task tree from JSON for one agent type. Use case: register guard AI at layout start. | Agent type             *(string)* <br>Network JSON             *(string)* <br> |
| Setup: Register Utility Scorer | Loads a utility scoring rule from JSON. Use case: tune attack vs retreat behavior by data. | Scorer JSON             *(string)* <br> |
| Setup: Set Global State Key | Sets a value shared by all agents. Use case: toggle a global alarm state. | Key             *(string)* <br>Value             *(any)* <br> |
| Setup: Set World State Key | Sets one value for one agent. Use case: update health or target visibility each tick. | Agent UID             *(number)* <br>Key             *(string)* <br>Value             *(any)* <br> |


---
## Conditions
| Condition | Description | Params
| --- | --- | --- |
| Is Agent In Squad | Checks current squad membership. Use case: run squad-only logic per agent. | Agent UID *(number)* <br>Squad ID *(string)* <br> |
| Is Slot Free | Checks if a slot is available. Use case: only reserve cover if not already occupied. | Squad ID *(string)* <br>Slot Type *(string)* <br>Slot ID *(string)* <br> |
| Is Squad Leader | Checks leader status in current squad. Use case: leader-only tactic writes. | Agent UID *(number)* <br> |
| On Slot Released | Triggered when a slot is released or expires. Use case: make slot visible as available again. |  |
| On Slot Reserved | Triggered when a slot gets reserved. Use case: update debug overlays for cover claims. |  |
| On Squad Membership Changed | Triggered when an agent joins or leaves a squad. Use case: refresh squad HUD widgets. |  |
| On Squad State Changed | Triggered when shared squad key-values change. Use case: react when tactic flips. |  |
| Has World State Key | True if a world-state key exists. Use case: guard logic when optional data may be missing. | Agent UID *(number)* <br>Key *(string)* <br> |
| Is Agent Paused | True when planning is paused for that agent. Use case: skip AI updates during scripted moments. | Agent UID *(number)* <br> |
| Is Agent Planning | True when an agent has work to do. Use case: branch events when an NPC is currently busy. | Agent UID *(number)* <br> |
| Is Alert Tier | Checks the current alert tier name. Use case: run different events for suspicious vs combat. | Agent UID *(number)* <br>Tier *(combo)* <br> |
| Is Task Network Registered | True when a task network is loaded for that type. Use case: verify setup before spawning agents. | Agent Type *(string)* <br> |
| Is Utility Scorer Registered | True when a scorer ID is available. Use case: validate data packs before combat starts. | Scorer ID *(string)* <br> |
| On Alert State Changed | Triggered when alert tier changes. Use case: change music or UI for suspicion/combat states. |  |
| On Plan Failed | Triggered when no valid plan is found. Use case: force an idle or safe fallback action. |  |
| On Plan Interrupted | Triggered when high-urgency input interrupts a plan. Use case: swap from patrol to combat immediately. |  |
| On Primitive Task Started | Triggered when a primitive task begins. Use case: play movement or attack events for that task ID. |  |
| On Stimulus Received | Triggered when any stimulus is added. Use case: spawn investigation markers at stimulus coordinates. |  |
| On Task Completed | Triggered after task completion is reported. Use case: chain to the next animation state. |  |
| On Task Failed | Triggered when a task fails. Use case: run a fallback task or recovery behavior. |  |
| On Task Network Registered | Triggered after a network loads. Use case: print setup success in debug events. |  |


---
## Expressions
| Expression | Description | Return Type | Params
| --- | --- | --- | --- |
| AgentSquad | Gets the squad ID for an agent. Use case: print squad tags in debug text. | string | Agent UID *(number)* <br> | 
| AssignedSlotId | Gets assigned slot ID for an agent and slot type. Use case: drive movement to assigned cover node. | string | Agent UID *(number)* <br>Slot Type *(string)* <br> | 
| CountSquadAgents | Counts members in a squad. Use case: detect when reinforcements are needed. | number | Squad ID *(string)* <br> | 
| CountSquads | Counts active squads. Use case: monitor coordination load. | number |  | 
| GetSquadAgentUIDByIndex | Gets squad member UID at index. Use case: iterate members in a repeat loop. | number | Squad ID *(string)* <br>Index *(number)* <br> | 
| SlotOwner | Gets owner UID of a slot. Use case: verify which agent owns a cover slot. | number | Squad ID *(string)* <br>Slot Type *(string)* <br>Slot ID *(string)* <br> | 
| SquadLeader | Gets leader UID for a squad. Use case: route leader-only commands. | number | Squad ID *(string)* <br> | 
| SquadStateValue | Reads one shared squad state key. Use case: followers read current tactic. | any | Squad ID *(string)* <br>Key *(string)* <br> | 
| ActiveTask | Current active task for one agent. Use case: show simple behavior labels above NPCs. | string | Agent UID *(number)* <br> | 
| AlertLevel | Alert level value from trigger context. Use case: drive bar fill in a stealth meter. | number |  | 
| AlertTierIndex | Numeric alert tier from trigger context. Use case: simple tier-based UI indicators. | number |  | 
| AlertTierName | Named alert tier from trigger context. Use case: show readable debug text in HUD. | string |  | 
| CompletedTask | Completed task ID from trigger context. Use case: reward points for finished objective tasks. | string |  | 
| CurrentTask | Current started task ID. Use case: branch events by task name like patrol or chase. | string |  | 
| EvaluateScorer | Returns scorer value for an agent now. Use case: graph utility output while balancing AI. | number | Agent UID *(number)* <br>Scorer ID *(string)* <br> | 
| FailedCompoundTask | Compound task where planning failed. Use case: log broken network branches while testing. | string |  | 
| FailedTask | Failed task ID from trigger context. Use case: retry or switch to a safer fallback action. | string |  | 
| GlobalStateValue | Reads one shared global-state value. Use case: branch logic when global alarm is active. | any | Key *(string)* <br> | 
| InterruptedTask | Task that got interrupted. Use case: stop old animations cleanly before new behavior starts. | string |  | 
| InterruptScore | Score that caused the last interruption. Use case: tune threshold to avoid over-reacting. | number |  | 
| NewTask | New task after interruption. Use case: immediately start VFX for emergency reactions. | string |  | 
| PlanLength | Remaining task count in the plan. Use case: detect when agents are close to idle. | number | Agent UID *(number)* <br> | 
| PlanTaskAtIndex | Task ID at a plan index. Use case: preview next action for debugging UI. | string | Agent UID *(number)* <br>Index *(number)* <br> | 
| PreviousTask | Previous task ID before current one. Use case: detect when behavior transitions happen. | string |  | 
| PreviousTierIndex | Previous alert tier index. Use case: detect if alert increased or decreased. | number |  | 
| RegisteredAgentType | Last registered agent type key. Use case: verify setup order in startup events. | string |  | 
| StimulusIntensity | Stimulus intensity value. Use case: scale reaction speed by how strong the event was. | number |  | 
| StimulusType | Stimulus type string from trigger context. Use case: react differently to sound vs visual cues. | string |  | 
| StimulusX | Stimulus X coordinate. Use case: send NPC to investigate that position. | number |  | 
| StimulusY | Stimulus Y coordinate. Use case: mark a noise location on minimap. | number |  | 
| TriggerAgentUID | Agent UID from the latest trigger. Use case: pick the exact instance to move or animate. | number |  | 
| WorldStateValue | Reads one world-state value for an agent. Use case: display health or awareness in UI. | any | Agent UID *(number)* <br>Key *(string)* <br> | 
| CountAgents | Current registered agent count. Use case: monitor AI population for performance tuning. | number |  | 
| CountRegisteredNetworks | How many task networks are loaded. Use case: quick startup validation in debug builds. | number |  | 
| CountRegisteredScorers | How many utility scorers are loaded. Use case: confirm balance data loaded correctly. | number |  | 
| CountRegisteredTasks | Number of primitive tasks for one type. Use case: verify network content during setup. | number | Agent Type *(string)* <br> | 
| GetAgentUIDByIndex | Gets agent UID by list index. Use case: loop through all managed agents. | number | Index *(number)* <br> | 
| GetRegisteredTaskByIndex | Gets primitive task ID by index. Use case: print all registered tasks to a debug panel. | string | Agent Type *(string)* <br>Index *(number)* <br> | 


---
## Changelog

**1.0.0.1**

**1.0.0.0**

**0.0.0.0**
- **Added:** Initial release.
