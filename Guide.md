# Utility-Driven HTN (Hierarchical Task Network) Manager Guide

This addon is a headless AI decision manager for Construct 3 that combines **HTN planning**, **utility scoring**, and optional **cross-agent coordination** so you can build reactive enemies and NPCs without writing giant event-sheet state machines. It solves the common scaling problem where AI logic becomes hard to maintain as projects grow, and it gives you a data-first pipeline where behaviors come from builder ACEs, world state, and reusable action/condition/expression calls.

## Table of Contents
1. [Scenarios Where This Addon Excels](#1-scenarios-where-this-addon-excels)
2. [Core Concepts](#2-core-concepts)
3. [Project Setup](#3-project-setup)
4. [Plugin Properties](#4-plugin-properties)
5. [Setup and Registration](#5-setup-and-registration)
6. [Planning and Execution Control](#6-planning-and-execution-control)
7. [Alert and Stimulus System](#7-alert-and-stimulus-system)
8. [Performance and Time Slicing](#8-performance-and-time-slicing)
9. [Cross-Agent Coordination](#9-cross-agent-coordination)
10. [Creating Content at Scale](#10-creating-content-at-scale)
11. [Variant Seeding: Same Archetype, Different Personality](#11-variant-seeding-same-archetype-different-personality)
12. [Using This Addon with Advanced Random Addon](#12-using-this-addon-with-advanced-random-addon)
13. [Multiplayer Considerations](#13-multiplayer-considerations)
14. [Actions Reference](#14-actions-reference)
15. [Conditions Reference](#15-conditions-reference)
16. [Expressions Reference](#16-expressions-reference)
17. [Triggers Reference](#17-triggers-reference)
18. [System Use Cases](#18-system-use-cases)
19. [Game Use Cases](#19-game-use-cases)
20. [Other Game Use Cases](#20-other-game-use-cases)
21. [C3 Debugger](#21-c3-debugger)
22. [Scripting (C3 Script / JavaScript)](#22-scripting-c3-script--javascript)
23. [Feature Deep-Dives](#23-feature-deep-dives)
24. [Working with Companion Behavior Agent Addon](#24-working-with-companion-behavior-agent-addon)
25. [Tips and Common Mistakes](#25-tips-and-common-mistakes)

## 1. Scenarios Where This Addon Excels
- **Fast action AI with immediate reactions:** Great for games where enemies must switch from patrol to attack quickly when a high-intensity stimulus arrives.
- **Stealth games with alert tiers:** Excellent for multi-stage suspicion systems where enemies progress from unaware to combat based on sensed inputs.
- **Large NPC projects:** Useful when you have dozens or hundreds of unique NPC variants and need a content pipeline that avoids copy-paste event sheets.
- **Tactical squads:** Works well when agents share squad-level state such as assigned cover slots, flank sides, and coordinated replans.
- **Data-driven balancing:** Strong fit when designers want to tweak scoring curves and thresholds without rewriting logic.
- **Performance-constrained projects:** Helpful on lower-end targets due to interval planning, per-update budgets, and time slicing.

## 2. Core Concepts
### The problem this addon solves
Without a manager, AI often becomes a web of booleans, timers, and branches spread across many event sheets. That causes brittle behavior and slow iteration. This addon centralizes planning and state checks so your event sheet focuses on effects and responses, not decomposition logic.

### Key design decisions
- **Headless architecture:** The addon decides tasks. You perform movement, animation, VFX, and gameplay effects in event sheets.
- **World-state ownership by game logic:** You control state values and feed them into the planner.
- **Data-first planning:** Task networks and utility scorers are registered from builder ACEs (or JSON when needed).
- **Single global manager:** One plugin instance manages all registered agents.
- **Optional coordination layer:** Squad and slot systems are additive and do not break single-agent setups.

### Key concepts at a glance
| Concept | Meaning |
| --- | --- |
| **Task network** | Data model of compound and primitive tasks for one archetype. |
| **Utility scorer** | Weighted curve set that outputs a score used for branch ranking. |
| **World state** | Per-agent and global key-value input used by conditions and scorers. |
| **Plan** | Ordered primitive task list produced by decomposition. |
| **Alert tier** | Named alert state derived from alert level thresholds. |
| **Squad state** | Shared coordination keys used by multiple agents in one group. |
| **Slot reservation** | Claim system with TTL for cover points, flank lanes, and other shared positions. |

## 3. Project Setup
1. Add the plugin object to your project.
2. At layout start, build and register task networks and utility scorers.
3. For each NPC, register world-state values and request plans.
4. On task triggers, perform gameplay actions.

Event sheet example:
```text
Event: On start of layout
  Action: Builder: Begin Utility Scorer -> "GuardCombat", Weighted sum
  Action: Builder: Add Utility Input (Linear) -> "GuardCombat", "targetVisible", 1, No, 0,0,1,1
  Action: Builder: Register Utility Scorer -> "GuardCombat"
  Action: Builder: Begin Task Network -> "guard", "Root"
  Action: Builder: Add Compound Task -> "guard", "Root"
  Action: Builder: Add Primitive Task -> "guard", "PatrolTask", "patrol"
  Action: Builder: Add Method -> "guard", "Root", "m_patrol"
  Action: Builder: Add Method Subtask -> "guard", "Root", "m_patrol", "PatrolTask"
  Action: Builder: Register Task Network -> "guard"
  // Build once, then register before first plan request

Event: Every tick
  Action: Setup: Set World State Key -> GuardUID, "targetVisible", TargetVisible
  Action: Setup: Set World State Key -> GuardUID, "health", GuardHealth
  // Keep world state fresh so planner decisions stay relevant

Event: Triggers: On Primitive Task Started
  Condition: Queries.CurrentTask = "shoot"
  Action: Sprite: Set animation -> "Shoot"
  // Manager chooses the task, game executes the effect
```

## 4. Plugin Properties
| Property | Type | Default | Description |
| --- | --- | --- | --- |
| Enabled | Boolean | true | Turns manager processing on or off. Useful for pause menus or cutscenes. |
| Debug mode | Boolean | false | Prints decision details to console for diagnosis and balancing. |
| Planning mode | Combo | per_frame | Chooses per-frame or interval planning updates. Start with per-frame for small scenes. |
| Planning interval (sec) | Number | 0.1 | Seconds between planning passes when interval mode is active. |
| Max agents per update | Integer | 0 | Caps number of agents processed per update. 0 means all. |
| Planning time slice (sec) | Number | 0 | Max planning time budget each update. 0 disables slice. |
| Interrupt threshold | Number | 0.75 | Minimum score required to interrupt current task. |
| Max plan depth | Integer | 20 | Safety cap for recursive decomposition depth. |
| Alert decay rate | Number | 0.05 | Alert drop per second without new stimuli. |
| Alert tier 1 | Number | 0.25 | Threshold for suspicious tier. |
| Alert tier 2 | Number | 0.55 | Threshold for alerted tier. |
| Alert tier 3 | Number | 0.8 | Threshold for combat tier. |

## 5. Setup and Registration
This feature group handles builder-driven data authoring, registration, and state writes.

Use it when:
- Initializing archetypes.
- Setting runtime values from your gameplay systems.
- Sharing global state across many agents.

Event sheet example:
```text
Event: On start of layout
  Action: Builder: Begin Utility Scorer -> "DroneSearch", Weighted sum
  Action: Builder: Add Utility Input (Linear) -> "DroneSearch", "targetVisible", 1, No, 0,0,1,1
  Action: Builder: Register Utility Scorer -> "DroneSearch"
  Action: Builder: Begin Task Network -> "drone", "Root"
  Action: Builder: Add Compound Task -> "drone", "Root"
  Action: Builder: Add Primitive Task -> "drone", "SearchTask", "search"
  Action: Builder: Add Method -> "drone", "Root", "m_search"
  Action: Builder: Add Method Subtask -> "drone", "Root", "m_search", "SearchTask"
  Action: Builder: Register Task Network -> "drone"
  // Register once per archetype with no raw JSON required

Event: Every tick
  Action: Setup: Set Global State Key -> "alarmActive", AlarmFlag
  Action: Setup: Set World State Key -> DroneUID, "distanceToTarget", DistToPlayer
  // Feed planner with current context
```

Gotchas:
- Register all required scorer IDs before relying on utility-ranked methods.
- Keep key naming consistent across network conditions and world-state writes.

### 5.1 Builder ACEs (No JSON in Event Sheets)
Use this flow when you want designers or event-sheet users to author AI directly in Construct.

Recommended order:
1. Begin scorer draft.
2. Add one or more utility inputs.
3. Register scorer.
4. Begin task-network draft.
5. Add compound and primitive tasks.
6. Add methods per compound task.
7. Add method conditions and subtasks.
8. Optionally assign method utility scorer IDs.
9. Register task network.

Builder ACE quick reference:
- `Builder: Begin Task Network`
- `Builder: Add Compound Task`
- `Builder: Add Primitive Task`
- `Builder: Add Method`
- `Builder: Add Method Condition`
- `Builder: Add Method Subtask`
- `Builder: Set Method Utility Scorer`
- `Builder: Register Task Network`
- `Builder: Begin Utility Scorer`
- `Builder: Add Utility Input (Linear)`
- `Builder: Register Utility Scorer`

### 5.2 Builder Use Cases and Pseudo-Event Recipes
All examples below are event-sheet friendly and avoid raw JSON strings.

1. Basic patrol fallback (single method)
```text
Event: On start of layout
  Action: Builder: Begin Task Network -> "guard", "Root"
  Action: Builder: Add Compound Task -> "guard", "Root"
  Action: Builder: Add Primitive Task -> "guard", "PatrolTask", "patrol"
  Action: Builder: Add Method -> "guard", "Root", "m_patrol"
  Action: Builder: Add Method Subtask -> "guard", "Root", "m_patrol", "PatrolTask"
  Action: Builder: Register Task Network -> "guard"
```

2. Combat branch with visibility gate
```text
Event: On start of layout
  Action: Builder: Add Primitive Task -> "guard", "ChaseTask", "chase"
  Action: Builder: Add Method -> "guard", "Root", "m_chase"
  Action: Builder: Add Method Condition -> "guard", "Root", "m_chase", "targetVisible", ==, 1
  Action: Builder: Add Method Subtask -> "guard", "Root", "m_chase", "ChaseTask"
```

3. Investigate-noise branch before patrol
```text
Event: On start of layout
  Action: Builder: Add Primitive Task -> "guard", "InvestigateTask", "investigate"
  Action: Builder: Add Method -> "guard", "Root", "m_investigate"
  Action: Builder: Add Method Condition -> "guard", "Root", "m_investigate", "heardNoise", ==, 1
  Action: Builder: Add Method Subtask -> "guard", "Root", "m_investigate", "InvestigateTask"
```

4. Health-based retreat branch
```text
Event: On start of layout
  Action: Builder: Add Primitive Task -> "guard", "RetreatTask", "retreat"
  Action: Builder: Add Method -> "guard", "Root", "m_retreat"
  Action: Builder: Add Method Condition -> "guard", "Root", "m_retreat", "health", <, 25
  Action: Builder: Add Method Subtask -> "guard", "Root", "m_retreat", "RetreatTask"
```

5. Multi-step branch (take cover then shoot)
```text
Event: On start of layout
  Action: Builder: Add Primitive Task -> "guard", "TakeCoverTask", "take_cover"
  Action: Builder: Add Primitive Task -> "guard", "ShootTask", "shoot"
  Action: Builder: Add Method -> "guard", "Root", "m_cover_then_shoot"
  Action: Builder: Add Method Condition -> "guard", "Root", "m_cover_then_shoot", "targetVisible", ==, 1
  Action: Builder: Add Method Subtask -> "guard", "Root", "m_cover_then_shoot", "TakeCoverTask"
  Action: Builder: Add Method Subtask -> "guard", "Root", "m_cover_then_shoot", "ShootTask"
```

6. Utility scorer for aggression from distance
```text
Event: On start of layout
  Action: Builder: Begin Utility Scorer -> "AggroByDistance", Weighted sum
  Action: Builder: Add Utility Input (Linear) -> "AggroByDistance", "distanceToTarget", 1, Yes, 0,1,800,0
  Action: Builder: Register Utility Scorer -> "AggroByDistance"
```

7. Utility scorer for fear from low health
```text
Event: On start of layout
  Action: Builder: Begin Utility Scorer -> "FearByHealth", Weighted sum
  Action: Builder: Add Utility Input (Linear) -> "FearByHealth", "health", 1, Yes, 0,0,100,1
  Action: Builder: Register Utility Scorer -> "FearByHealth"
```

8. Utility-ranked method selection
```text
Event: On start of layout
  Action: Builder: Set Method Utility Scorer -> "guard", "Root", "m_chase", "AggroByDistance"
  Action: Builder: Set Method Utility Scorer -> "guard", "Root", "m_retreat", "FearByHealth"
  Action: Builder: Register Task Network -> "guard"
```

9. Alert-tier gated behavior
```text
Event: On start of layout
  Action: Builder: Add Method -> "guard", "Root", "m_full_alert"
  Action: Builder: Add Method Condition -> "guard", "Root", "m_full_alert", "alertTier", >=, 2
  Action: Builder: Add Method Subtask -> "guard", "Root", "m_full_alert", "ChaseTask"
```

10. Day/night schedule split
```text
Event: On start of layout
  Action: Builder: Add Primitive Task -> "guard", "SleepTask", "sleep"
  Action: Builder: Add Method -> "guard", "Root", "m_sleep"
  Action: Builder: Add Method Condition -> "guard", "Root", "m_sleep", "isNight", ==, 1
  Action: Builder: Add Method Subtask -> "guard", "Root", "m_sleep", "SleepTask"
```

11. Archetype reuse with minor variation
```text
Event: On start of layout
  Action: Builder: Begin Task Network -> "elite_guard", "Root"
  Action: Repeat same task graph pattern as "guard"
  Action: Builder: Set Method Utility Scorer -> "elite_guard", "Root", "m_chase", "AggroByDistance"
  Action: Builder: Register Task Network -> "elite_guard"
```

12. Safe rebuild during iteration
```text
Event: Keyboard On R pressed
  Action: Builder: Clear Task Network Draft -> "guard"
  Action: Builder: Begin Task Network -> "guard", "Root"
  Action: Recreate tasks and methods
  Action: Builder: Register Task Network -> "guard"
  // Lets you iterate quickly without editing external JSON assets
```

## 6. Planning and Execution Control
This feature group controls when and how plans are generated and consumed.

Use it when:
- Forcing immediate behavior changes.
- Pausing AI on specific agents.
- Managing fallback behavior for failures.

Event sheet example:
```text
Event: Player enters restricted zone
  Action: Planning: Invalidate Plan -> GuardUID
  Action: Planning: Request Plan -> GuardUID
  // Force rapid context switch

Event: Cutscene starts
  Action: Planning: Pause Planning -> GuardUID

Event: Cutscene ends
  Action: Planning: Resume Planning -> GuardUID
```

Gotchas:
- Do not spam immediate plan requests for every minor key change.
- Use invalidate for deferred replans when possible.

## 7. Alert and Stimulus System
This group handles awareness progression and reactive triggers.

Use it when:
- Registering vision, sound, damage, or alarm stimuli.
- Driving suspicion-to-combat transitions.
- Synchronizing UI and audio with alert state changes.

Event sheet example:
```text
Event: Guard sees player
  Action: Alert: Add Alert Stimulus -> GuardUID, "visual", 0.9, Player.X, Player.Y
  // High-intensity visual input can trigger interrupt and replan

Event: Triggers: On Alert State Changed
  Condition: Queries.AlertTierName = "combat"
  Action: Audio: Play -> "CombatStart"
```

Gotchas:
- Intensity and threshold tuning matter more than raw stimulus count.
- Use extended stimulus JSON when you need custom decay or state writes.

## 8. Performance and Time Slicing
This group helps you keep stable frame time as agent counts grow.

Use it when:
- Running many active AI agents.
- Targeting lower-end devices.
- Avoiding planning spikes.

Event sheet example:
```text
Event: On start of layout
  Action: Performance: Set Planning Mode -> Interval (seconds)
  Action: Performance: Set Planning Interval -> 0.2
  Action: Performance: Set Max Agents Per Update -> 25
  Action: Performance: Set Planning Time Slice -> 0.002
  // Budget planning work to reduce hitches
```

Gotchas:
- Overly strict caps can increase response latency.
- Tune interval and slice together, not in isolation.

## 9. Cross-Agent Coordination
This group adds squad-level shared state and slot ownership.

Use it when:
- Coordinating multiple enemies.
- Avoiding duplicate cover assignments.
- Creating leader-driven tactics.

Event sheet example:
```text
Event: On start of layout
  Action: Coordination: Assign Agent To Squad -> GuardA_UID, "alpha"
  Action: Coordination: Assign Agent To Squad -> GuardB_UID, "alpha"
  Action: Coordination: Set Squad Leader -> "alpha", GuardA_UID

Event: Leader updates tactic
  Action: Coordination: Set Squad State Key -> "alpha", "squad.tactic", "flank_left"
  Action: Coordination: Squad Plan Control -> Request Now, "alpha"
  // One write fans out through shared state and replans
```

Gotchas:
- Always use TTL for slots so abandoned reservations do not block teammates.
- Keep squad key naming stable and documented.

## 10. Creating Content at Scale
For projects with 100+ unique NPCs, avoid one-network-per-instance. Use **archetypes**, **variant seeds**, and **shared templates**.

Recommended pipeline:
1. Define 5-20 core archetype task-network blueprints (guard, sniper, brute, scout).
2. Define utility scorer libraries per combat style.
3. Build and register those blueprints through `Builder` ACE actions at startup.
4. Generate per-instance variants through world-state seeds.
5. Keep one naming convention for keys, methods, scorer IDs, and primitive task IDs.

### Builder-first scaling model
For small projects, hand-building one archetype in event sheets is fine.
For large projects, treat Builder ACEs as a **content compiler pipeline**:

1. Author archetype data in tables/JSON/config (outside the manager runtime format).
2. Convert each row into Builder ACE calls during bootstrap.
3. Register finalized scorers first, then task networks.
4. Validate with query expressions (`CountRegisteredNetworks`, `CountRegisteredScorers`, `CountRegisteredTasks`).
5. Spawn/enable agents only after validation passes.

This keeps your live AI format stable while letting designers edit high-level content safely.

### Why Builder ACEs scale better than raw network JSON in event sheets
- Better diffability: one action change is easier to review than long JSON strings.
- Better reuse: shared blocks ("add combat branch", "add retreat branch") can be reused across archetypes.
- Better onboarding: designers can read `Builder: Add Method Condition` directly in Event Sheet UI.
- Better migration: adding a new condition key or scorer can be scripted as a build step.

### Large-project bootstrap architecture
Split startup into phases:

1. `Phase A`: Register scorer library.
2. `Phase B`: Register archetype task networks.
3. `Phase C`: Register companion agents and assign `agentType`.
4. `Phase D`: Begin runtime world-state updates.

If one phase fails validation, halt later phases and report debug output.

Large-project event sheet example:

Large-project event sheet example:
  // Phase A: scorer library
  Action: For each ScorerRow in ScorerTable
    Action: Builder: Begin Utility Scorer -> ScorerRow.Id, ScorerRow.Aggregation
    Action: For each InputRow where InputRow.ScorerId = ScorerRow.Id
      Action: Builder: Add Utility Input (Linear) ->
              ScorerRow.Id,
              InputRow.WorldStateKey,
              InputRow.Weight,
              InputRow.Invert,
              InputRow.X1, InputRow.Y1, InputRow.X2, InputRow.Y2
    Action: Builder: Register Utility Scorer -> ScorerRow.Id

  // Phase B: archetype networks
  Action: For each Archetype in ArchetypeTable
    Action: Builder: Begin Task Network -> Archetype.Id, Archetype.RootTask

    Action: For each TaskRow where TaskRow.ArchetypeId = Archetype.Id and TaskRow.Type = "compound"
      Action: Builder: Add Compound Task -> Archetype.Id, TaskRow.TaskName

    Action: For each TaskRow where TaskRow.ArchetypeId = Archetype.Id and TaskRow.Type = "primitive"
      Action: Builder: Add Primitive Task -> Archetype.Id, TaskRow.TaskName, TaskRow.PrimitiveId

    Action: For each MethodRow where MethodRow.ArchetypeId = Archetype.Id
      Action: Builder: Add Method -> Archetype.Id, MethodRow.TaskName, MethodRow.MethodId
      Action: For each ConditionRow where ConditionRow.MethodKey = MethodRow.Key
        Action: Builder: Add Method Condition ->
                Archetype.Id,
                MethodRow.TaskName,
                MethodRow.MethodId,
                ConditionRow.Key,
                ConditionRow.Op,
                ConditionRow.Value
      Action: For each SubtaskRow where SubtaskRow.MethodKey = MethodRow.Key
        Action: Builder: Add Method Subtask ->
                Archetype.Id,
                MethodRow.TaskName,
                MethodRow.MethodId,
                SubtaskRow.SubtaskTaskName
      Action: If MethodRow.UtilityScorerId != ""
        Action: Builder: Set Method Utility Scorer ->
                Archetype.Id,
                MethodRow.TaskName,
                MethodRow.MethodId,
                MethodRow.UtilityScorerId

    Action: Builder: Register Task Network -> Archetype.Id

  // Phase C: sanity checks
  Action: Debug: Dump Agent State -> FirstAgentUID (optional)
  // Batch build keeps startup predictable and reviewable
    Action: Setup: Register Utility Scorer -> Scorer.Json

### Extension patterns for bigger projects
1. Archetype inheritance by convention
- Create base rows (for example `guard_base`) and append variant rows (`guard_elite`, `guard_night`).
- Reuse task names and only override method conditions/scorers where needed.

2. Role modules
- Keep method bundles in separate tables: `CombatModule`, `RetreatModule`, `InvestigateModule`.
- During build, include modules per archetype to avoid copy-paste branches.

3. Live hot-reload in dev builds
- Bind a debug hotkey to clear/rebuild one archetype draft:
  - `Builder: Clear Task Network Draft`
  - `Builder: Begin Task Network`
  - Reapply that archetype's rows
  - `Builder: Register Task Network`

4. Versioned content keys
- Namespace keys to avoid collisions in very large teams:
  - `combat.targetVisible`
  - `navigation.coverAvailable`
  - `seed.riskTolerance`

5. Validation gates
- After each archetype register, check expected primitive count:
  - `Queries.CountRegisteredTasks(archetypeId)`
- Fail fast when counts mismatch expected data-table values.

### Practical scaling checklist
- Keep primitive IDs stable across updates and save/load revisions.
- Register scorer IDs before any method references them.
- Use consistent method ID naming (`m_verb_context`).
- Keep builder phases deterministic (same order every boot).
- Centralize world-state key constants to avoid typo drift.
- Reserve immediate `Planning: Request Plan` for urgent events; use invalidate for bulk updates.
  // Batch registration keeps startup predictable
```

### Content strategy by game style
- **Hotline Miami style:** low-depth networks, high interrupt sensitivity, fast stimulus updates.
- **RPG / ARPG:** role-based archetypes, cooldown keys, support-target heuristics, moderate interval planning.
- **Dishonored-like stealth:** rich alert tiers, investigate/search compounds, line-of-sight and memory keys, lower interrupt threshold for urgent visual contact.

## 11. Variant Seeding: Same Archetype, Different Personality
**Variant seeding** means sharing one archetype network while changing world-state and scorer inputs per instance.

Examples:
1. Aggressive guard vs cautious guard
```text
Event: On spawn
  Action: Setup: Set World State Key -> UID, "seed.aggression", 0.9
  Action: Setup: Set World State Key -> UID, "seed.riskTolerance", 0.8

Event: On spawn (cautious)
  Action: Setup: Set World State Key -> UID, "seed.aggression", 0.3
  Action: Setup: Set World State Key -> UID, "seed.riskTolerance", 0.2
```

2. Patrol variant with different scan cadence
```text
Event: On spawn
  Action: Setup: Set World State Key -> UID, "seed.scanInterval", 0.6
  // Same network, different rhythm behavior
```

3. Elite variant with stronger replan urgency
```text
Event: On elite spawn
  Action: Setup: Set World State Key -> UID, "seed.interruptBias", 0.25
  // Used by scorer curves to favor interruptions
```

Gotchas:
- Seed values must be reflected in scorer curves or conditions, otherwise they do nothing.
- Keep seed keys namespaced, like seed.*.

## 12. Using This Addon with Advanced Random Addon
This integration is useful for deterministic variation and weighted behavior rolls.

Pattern:
1. Use Advanced Random to generate seeded values per agent.
2. Write those values into world state.
3. Let utility scorers consume those seeded keys.

Event sheet example:
```text
Event: On NPC spawn
  Action: AdvancedRandom: Set Seed -> UID
  Action: AdvancedRandom: WeightedFloat -> "aggression", 0.2, 0.9
  Action: Setup: Set World State Key -> UID, "seed.aggression", AdvancedRandom.Result

Event: On NPC spawn
  Action: AdvancedRandom: WeightedFloat -> "retreatBias", 0.1, 0.7
  Action: Setup: Set World State Key -> UID, "seed.retreatBias", AdvancedRandom.Result
  // Stable random identity per NPC
```

Tip:
- Seed with stable identifiers for reproducible personalities across reloads.

## 13. Multiplayer Considerations
This addon can work with multiplayer if you use an **authoritative model**.

Recommended model:
1. Server or host computes planner state and decisions.
2. Clients receive replicated task and state outputs.
3. Clients run visual execution only, or run predictive reads with reconciliation.

Event sheet pseudocode:
```text
Event: Host tick
  Action: Planning: Request Plan -> UID
  Action: Network: Send -> UID, ActiveTask, AlertLevel, SquadStateSnapshot

Event: Client receives AI packet
  Action: Setup: Set World State Key -> UID, "net.activeTask", Packet.ActiveTask
  // Client displays behavior, host remains authority
```

Limitations:
- There is no built-in rollback or replication protocol in this addon.
- You must serialize and sync required keys yourself.

## 14. Actions Reference
### Coordination
| Action | Description |
| --- | --- |
| Assign Agent To Squad | Assigns an agent to a named squad for shared coordination. |
| Remove Agent From Squad | Removes an agent from its squad and clears related coordination state. |
| Set Squad Leader | Sets leader UID for a squad, used for leader-driven patterns. |
| Set Squad State Key | Writes a shared key for all squad members to consume. |
| Clear Squad State Key | Removes one shared squad key. |
| Reserve Slot | Claims a slot with TTL so teammates do not duplicate it. |
| Release Slot | Releases one slot reservation manually. |
| Set Slot Position | Defines one slot position from coordinates. |
| Load Slot Positions From JSON | Imports many slots from JSON array data. |
| Load Slot Positions From World State Key | Imports slot map from global or agent world state. |
| Auto Assign Nearest Free Slot | Chooses and reserves nearest available slot by distance. |
| Set Slot Reservation | Combined action for reserve or release modes. |
| Invalidate Squad Plans | Marks all squad members for deferred replan. |
| Request Squad Plans | Triggers immediate replans for squad members. |
| Squad Plan Control | Combined action for invalidate or immediate request modes. |

### Performance
| Action | Description |
| --- | --- |
| Set Enabled | Enables or disables manager processing. |
| Set Planning Mode | Switches per-frame vs interval planning mode. |
| Set Planning Interval | Sets interval duration in seconds. |
| Set Max Agents Per Update | Caps number of agents processed per update. |
| Set Planning Time Slice | Sets per-update planning time budget in seconds. |
| Process Planning Now | Runs one planning pass immediately. |

### Setup
| Action | Description |
| --- | --- |
| Register Task Network | Registers one archetype task network from JSON. |
| Register Utility Scorer | Registers one utility scorer from JSON. |
| Set World State Key | Writes one per-agent world-state key. |
| Set Global State Key | Writes one global world-state key. |
| Clear World State Key | Removes one per-agent world-state key. |

### Planning
| Action | Description |
| --- | --- |
| Request Plan | Requests immediate plan generation for an agent. |
| Invalidate Plan | Marks an agent plan stale for next processing pass. |
| Force Task | Pushes a task to front of plan queue. |
| Pause Planning | Pauses planning for one agent. |
| Resume Planning | Resumes planning and marks plan stale. |
| Clear Plan | Clears remaining plan tasks. |

### Alert
| Action | Description |
| --- | --- |
| Set Alert Level | Sets alert level directly. |
| Add Alert Stimulus | Adds a simple stimulus event. |
| Add Alert Stimulus Extended | Adds detailed stimulus via JSON payload. |
| Clear Stimuli | Clears stored stimuli for an agent. |
| Decay Alert | Manually lowers alert amount. |

### Debug
| Action | Description |
| --- | --- |
| Set Debug Mode | Enables or disables runtime debug logging. |
| Dump Agent State | Logs one agent diagnostic snapshot. |

## 15. Conditions Reference
| Condition | Description |
| --- | --- |
| Is Agent Planning | True when agent currently has active task/work. |
| Is Agent Paused | True when planning is paused for that agent. |
| Is Alert Tier | Checks agent alert tier against named value. |
| Has World State Key | True when a key exists in agent state map. |
| Is Task Network Registered | True when archetype network exists. |
| Is Utility Scorer Registered | True when scorer ID exists. |
| Is Agent In Squad | True when agent belongs to specified squad. |
| Is Squad Leader | True when agent is leader of its squad. |
| Is Slot Free | True when slot is unowned or expired. |
| On Task Network Registered | Trigger when task network registration succeeds. |
| On Primitive Task Started | Trigger when new primitive task starts. |
| On Task Completed | Trigger when task completion is marked. |
| On Task Failed | Trigger when task failure is marked. |
| On Plan Failed | Trigger when planning cannot produce a plan. |
| On Plan Interrupted | Trigger when current plan is interrupted by score threshold. |
| On Alert State Changed | Trigger when alert tier boundary changes. |
| On Stimulus Received | Trigger when stimulus is received. |
| On Squad State Changed | Trigger when shared squad key changes. |
| On Slot Reserved | Trigger when slot reservation occurs. |
| On Slot Released | Trigger when slot release or expiration occurs. |
| On Squad Membership Changed | Trigger when agents join or leave squads. |

## 16. Expressions Reference
| Expression | Returns | Description |
| --- | --- | --- |
| TriggerAgentUID | number | Trigger context UID. |
| CurrentTask | string | Current task in trigger context. |
| PreviousTask | string | Previous task in trigger context. |
| CompletedTask | string | Completed task in trigger context. |
| FailedTask | string | Failed task in trigger context. |
| FailedCompoundTask | string | Failed compound node in plan context. |
| InterruptedTask | string | Interrupted task in plan interrupt trigger. |
| NewTask | string | New selected task after interrupt. |
| InterruptScore | number | Score that triggered interruption. |
| AlertTierIndex | number | Alert tier index in trigger context. |
| AlertTierName | string | Alert tier name in trigger context. |
| AlertLevel | number | Alert level in trigger context. |
| PreviousTierIndex | number | Previous tier index in trigger context. |
| StimulusType | string | Stimulus type from trigger. |
| StimulusX | number | Stimulus X coordinate. |
| StimulusY | number | Stimulus Y coordinate. |
| StimulusIntensity | number | Stimulus intensity value. |
| RegisteredAgentType | string | Last registered agent type key. |
| ActiveTask(agentUID) | string | Active task for specific agent. |
| PlanLength(agentUID) | number | Remaining plan length. |
| PlanTaskAtIndex(agentUID, index) | string | Task at index in remaining plan. |
| WorldStateValue(agentUID, key) | any | Per-agent or combined state value lookup. |
| GlobalStateValue(key) | any | Global state value lookup. |
| EvaluateScorer(agentUID, scorerId) | number | Scorer output for agent state snapshot. |
| CountRegisteredNetworks | number | Number of registered networks. |
| CountRegisteredScorers | number | Number of registered scorers. |
| CountAgents | number | Number of registered agents. |
| GetAgentUIDByIndex(index) | number | Agent UID by registry index. |
| CountRegisteredTasks(agentType) | number | Primitive task count for archetype. |
| GetRegisteredTaskByIndex(agentType, index) | string | Primitive task ID at index. |
| AgentSquad(agentUID) | string | Squad ID for an agent. |
| SquadLeader(squadId) | number | Leader UID for squad. |
| SquadStateValue(squadId, key) | any | Shared squad state key value. |
| CountSquadAgents(squadId) | number | Number of squad members. |
| GetSquadAgentUIDByIndex(squadId, index) | number | Member UID by index. |
| SlotOwner(squadId, slotType, slotId) | number | Current slot owner UID, or 0. |
| AssignedSlotId(agentUID, slotType) | string | Assigned slot ID for agent and type. |
| CountSquads | number | Number of active squads. |

## 17. Triggers Reference
| Trigger | Description |
| --- | --- |
| On Task Network Registered | Fires after successful task network registration. |
| On Primitive Task Started | Fires when a primitive task starts. |
| On Task Completed | Fires when task completion is marked. |
| On Task Failed | Fires when task failure is marked. |
| On Plan Failed | Fires when planning returns no valid plan. |
| On Plan Interrupted | Fires when score threshold interrupts current plan. |
| On Alert State Changed | Fires when alert tier changes. |
| On Stimulus Received | Fires when a new stimulus is added. |
| On Squad State Changed | Fires when shared squad state changes. |
| On Slot Reserved | Fires when slot is reserved. |
| On Slot Released | Fires when slot is released or expires. |
| On Squad Membership Changed | Fires when member joins or leaves squad. |

## 18. System Use Cases
### Registration System
One-line: Loads and validates planning/scoring definitions before runtime use.

Use case 1:
- **Scenario:** Bootstrapping archetypes at layout start.
```text
Event: On start of layout
  Action: Setup: Register Task Network -> "guard", GuardNetworkJson
  Action: Setup: Register Task Network -> "drone", DroneNetworkJson
  Action: Setup: Register Utility Scorer -> GuardCombatScorerJson
```
Note: Keep IDs stable across updates.

Use case 2:
- **Scenario:** Hot-loading balance scorer while testing.
```text
Event: Debug hotkey pressed
  Action: Setup: Register Utility Scorer -> UpdatedRetreatScorerJson
```
Note: New scorer values apply on next evaluation.

### World State System
One-line: Supplies planner and scorer inputs per agent and globally.

Use case 1:
- **Scenario:** Updating target visibility from LOS checks.
```text
Event: Every tick
  Action: Setup: Set World State Key -> UID, "targetVisible", LOSVisible
```

Use case 2:
- **Scenario:** Global alarm toggles all guards.
```text
Event: Alarm triggered
  Action: Setup: Set Global State Key -> "alarmActive", 1
```

### Planning System
One-line: Builds and maintains task lists from HTN decomposition and utility ranking.

Use case 1:
- **Scenario:** Deferred replan after non-urgent change.
```text
Event: Patrol route changed
  Action: Planning: Invalidate Plan -> UID
```

Use case 2:
- **Scenario:** Immediate tactical switch.
```text
Event: Player uses loud weapon nearby
  Action: Planning: Request Plan -> UID
```

### Alert System
One-line: Tracks sensory pressure and state transitions through alert tiers.

Use case 1:
- **Scenario:** Audio cue increases suspicion.
```text
Event: Noise event
  Action: Alert: Add Alert Stimulus -> UID, "audio", 0.35, NoiseX, NoiseY
```

Use case 2:
- **Scenario:** Scripted calm-down after search timeout.
```text
Event: Search timer finished
  Action: Alert: Decay Alert -> UID, 0.4
```

### Coordination System
One-line: Shares squad-level state and ownership rules across agents.

Use case 1:
- **Scenario:** Leader sets squad tactic.
```text
Event: Squad leader sees player
  Action: Coordination: Set Squad State Key -> "alpha", "squad.tactic", "push"
  Action: Coordination: Squad Plan Control -> Request Now, "alpha"
```

Use case 2:
- **Scenario:** Reserve unique cover slots.
```text
Event: Guard needs cover
  Action: Coordination: Auto Assign Nearest Free Slot -> UID, "alpha", "cover", Guard.X, Guard.Y, 800, 1.2
```

### Save/Load System
One-line: Persists planner, state, and coordination maps across savegames.

Use case 1:
- **Scenario:** Restoring mid-fight state from save.
```text
Event: Savegame loaded
  // Manager restores plans, states, squads, and slot ownership from internal JSON
```
Note: Keep world-state schema stable across versions.

## 19. Game Use Cases
### 1. Minimal patrol/chase
- **Scenario:** One enemy patrols unless player is seen.
```text
Event: Every tick
  Action: Setup: Set World State Key -> UID, "targetVisible", PlayerVisible

Event: Triggers: On Primitive Task Started
  Condition: Queries.CurrentTask = "patrol"
  Action: EnemyMoveTo: Set target -> PatrolPointX, PatrolPointY

Event: Triggers: On Primitive Task Started
  Condition: Queries.CurrentTask = "chase"
  Action: EnemyMoveTo: Set target -> Player.X, Player.Y
```

### 2. Investigate sound then return
- **Scenario:** Guard investigates audio cue and then resumes patrol.
```text
Event: Sound emitted
  Action: Alert: Add Alert Stimulus -> GuardUID, "audio", 0.5, SoundX, SoundY

Event: Triggers: On Primitive Task Started
  Condition: Queries.CurrentTask = "investigate"
  Action: EnemyMoveTo: Set target -> Queries.StimulusX, Queries.StimulusY
```

### 3. Health-based retreat
- **Scenario:** Enemy retreats below threshold.
```text
Event: Every tick
  Action: Setup: Set World State Key -> UID, "health", EnemyHP

Event: Triggers: On Primitive Task Started
  Condition: Queries.CurrentTask = "retreat"
  Action: EnemyMoveTo: Set target -> SafePoint.X, SafePoint.Y
```

### 4. Boss phase switches
- **Scenario:** Boss changes tactics by health bands.
```text
Event: Boss damaged
  Action: Setup: Set World State Key -> BossUID, "health", BossHP
  Action: Planning: Invalidate Plan -> BossUID
```

### 5. Companion support AI
- **Scenario:** Companion alternates follow, loot, and heal self.
```text
Event: Every tick
  Action: Setup: Set World State Key -> CompanionUID, "nearLoot", LootNearby
  Action: Setup: Set World State Key -> CompanionUID, "health", CompanionHP
```

### 6. Drone alarm scramble
- **Scenario:** Drones switch to scramble path on global alarm.
```text
Event: Alarm starts
  Action: Setup: Set Global State Key -> "alarmActive", 1
  Action: Planning: Invalidate Plan -> DroneUID
```

### 7. Civilian panic spread
- **Scenario:** Civilians enter panic routine based on nearby danger.
```text
Event: Danger pulse
  Action: Alert: Add Alert Stimulus -> CivilianUID, "danger", 0.8, DangerX, DangerY
```

### 8. Flank pair setup
- **Scenario:** Two agents split left/right flank slots.
```text
Event: On start of layout
  Action: Coordination: Set Slot Position -> "alpha", "flank", "left", 400, 300
  Action: Coordination: Set Slot Position -> "alpha", "flank", "right", 700, 300
```

### 9. Cover allocation by distance
- **Scenario:** Multiple guards take nearest free cover.
```text
Event: Combat begins
  Action: Coordination: Auto Assign Nearest Free Slot -> UID, "alpha", "cover", Guard.X, Guard.Y, 1000, 1
```

### 10. Squad regroup point
- **Scenario:** Leader sets rally destination.
```text
Event: Leader health low
  Action: Coordination: Set Squad State Key -> "alpha", "squad.targetX", RallyX
  Action: Coordination: Set Squad State Key -> "alpha", "squad.targetY", RallyY
```

### 11. Slot expiry fallback
- **Scenario:** Expired cover slot becomes free and reassigned.
```text
Event: Triggers: On Slot Released
  Action: Coordination: Auto Assign Nearest Free Slot -> Queries.TriggerAgentUID, "alpha", "cover", Guard.X, Guard.Y, 800, 1
```

### 12. Elite variant seed
- **Scenario:** Same archetype with elite personality.
```text
Event: Elite spawn
  Action: Setup: Set World State Key -> UID, "seed.aggression", 0.95
  Action: Setup: Set World State Key -> UID, "seed.riskTolerance", 0.9
```

### 13. Civilian cautious seed
- **Scenario:** Same archetype with timid personality.
```text
Event: Civilian spawn
  Action: Setup: Set World State Key -> UID, "seed.aggression", 0.1
  Action: Setup: Set World State Key -> UID, "seed.riskTolerance", 0.15
```

### 14. Scripted override task
- **Scenario:** Force scripted animation task for cutscene beat.
```text
Event: Cutscene cue
  Action: Planning: Force Task -> UID, "look_at_player"
```

### 15. Pause AI during dialogue bubble
- **Scenario:** Freeze one NPC while dialogue is active.
```text
Event: Dialogue opens
  Action: Planning: Pause Planning -> UID

Event: Dialogue closes
  Action: Planning: Resume Planning -> UID
```

### 16. Time-sliced crowd behavior
- **Scenario:** 120 NPCs update with stable frame time.
```text
Event: On start of layout
  Action: Performance: Set Planning Mode -> Interval (seconds)
  Action: Performance: Set Planning Interval -> 0.2
  Action: Performance: Set Max Agents Per Update -> 30
  Action: Performance: Set Planning Time Slice -> 0.002
```

### 17. Dynamic slot map from JSON
- **Scenario:** Load slot map per room from data asset.
```text
Event: Room loaded
  Action: Coordination: Load Slot Positions From JSON -> "alpha", "cover", RoomCoverSlotsJson
```

### 18. Dynamic slot map from world state
- **Scenario:** Hot-swap slot maps from mission state key.
```text
Event: Mission phase changes
  Action: Setup: Set Global State Key -> "coverSlots", NewCoverSlotsJson
  Action: Coordination: Load Slot Positions From World State Key -> "alpha", "cover", Global, "coverSlots", 0
```

### 19. Combined slot control event-sheet simplification
- **Scenario:** One action handles reserve/release branch.
```text
Event: Agent enters cover
  Action: Coordination: Set Slot Reservation -> Reserve, "alpha", "cover", SlotId, UID, 1

Event: Agent leaves cover
  Action: Coordination: Set Slot Reservation -> Release, "alpha", "cover", SlotId, UID, 1
```

### 20. Combined squad replan control
- **Scenario:** Toggle between deferred and immediate squad updates.
```text
Event: Low urgency tactic update
  Action: Coordination: Squad Plan Control -> Invalidate, "alpha"

Event: High urgency tactic update
  Action: Coordination: Squad Plan Control -> Request Now, "alpha"
```

### 21. Host-authoritative multiplayer AI
- **Scenario:** Host computes plans, clients render behavior.
```text
Event: Host update
  Action: Planning: Request Plan -> UID
  Action: Network: Send AI Snapshot -> UID, Queries.ActiveTask(UID), Queries.AlertLevel
```

### 22. Debug-driven balancing loop
- **Scenario:** Tune utility thresholds while game is running.
```text
Event: Debug hotkey
  Action: Debug: Set Debug Mode -> true
  Action: Debug: Dump Agent State -> UID
```

## 20. Other Game Use Cases
**Top-down stealth:** Use alert tiers, investigate tasks, and slot reservations for believable guard reactions.

**Arena shooter PvE:** Use quick interrupt thresholds and aggressive scorer curves for pressure-heavy enemy behavior.

**Tactical RPG:** Use squad state keys for formation intent and per-unit variation via seeds.

**ARPG dungeon crawler:** Use archetype networks and seed keys to keep enemy packs varied.

**Immersive sim stealth:** Combine rich world-state inputs and compound investigate/search/combat branches.

**Survival horror:** Use sparse stimuli and high threshold transitions to create tension spikes.

**Extraction shooter PvE mode:** Use squad coordination for flanks, suppress, and fallback behavior.

**Stealth puzzle rooms:** Use deterministic patrol networks with event-triggered replans.

**Horde defense:** Use performance mode with interval planning and time slicing.

**Open-world NPC ecology:** Use archetype data packs and variant seeds for broad population diversity.

**Narrative adventure with social NPCs:** Use low-intensity utility weights for routine, idle, and social proximity actions.

**RTS hero squad companion AI:** Use leader-following squad keys and slot reservations for tactical spacing.

**Roguelite action game:** Seed behavior values from run seed for stable but varied encounters.

**Tactical infiltration game:** Assign squad roles and synchronized plan requests for breach moments.

**Co-op PvE with AI allies:** Use global state keys and coordinated assist behaviors.

**Boss rush game:** Use phase-based world-state updates and force-task overrides for scripted beats.

**Sci-fi drone sim:** Use alarm global keys and fast-plan cycles for swarming responses.

**Zombie survival:** Use simple archetypes with variant seeds for spread-out threat patterns.

**Metroidvania with smart enemies:** Use room-based slot maps and context-triggered replans.

**Turn-lite real-time tactics:** Use interval planning to keep deterministic update cadence.

**City builder with guard patrols:** Use low-frequency planning and squad assignment by district.

**Sports management with AI opponents:** Use utility scorers for strategy selection under changing match state.

## 21. C3 Debugger
This addon implements debugger properties through _getDebuggerProperties.

How to open:
1. Preview project.
2. Open Construct debugger panel.
3. Select manager instance.

Debugger fields:
| Field | Meaning |
| --- | --- |
| $registeredNetworks | Number of loaded task networks. |
| $registeredScorers | Number of loaded utility scorers. |
| $activeAgents | Number of currently tracked agents. |
| $enabled | Whether manager processing is active. |
| $planningTimeSliceSec | Current planning time budget per update. |
| $lastPlanRequestAgentUID | Last UID involved in plan-trigger context. |
| $lastPlanResult | Last plan result string (success, failed, interrupted). |
| $lastInterruptScore | Score that caused latest plan interruption. |
| $globalStateKeys | Comma list of global state keys currently set. |

## 22. Scripting (C3 Script / JavaScript)
### Accessing the plugin instance
Use your object reference from runtime and call plugin methods on that instance.

```javascript
// Example shape, actual lookup depends on your project object names
const managerInst = runtime.objects.TactiCoreManager.getFirstInstance();
```

### Calling actions from script
Actions are ACE-exposed and callable as PascalCase methods.

```javascript
// JSON registration path (still supported)
managerInst.RegisterTaskNetwork("guard", networkJson);
managerInst.RegisterUtilityScorer(scorerJson);

// Builder path (preferred for builder-authored setups)
managerInst.BeginUtilityScorer("guard_combat", "weighted_sum");
managerInst.AddUtilityInputLinear("guard_combat", "targetVisible", 1, "0", 0, 0, 1, 1);
managerInst.RegisterBuiltUtilityScorer("guard_combat");
managerInst.BeginTaskNetwork("guard", "guard_root");
managerInst.AddCompoundTask("guard", "guard_root");
managerInst.AddPrimitiveTask("guard", "chase_target", "chase");
managerInst.AddMethod("guard", "guard_root", "m_chase");
managerInst.AddMethodCondition("guard", "guard_root", "m_chase", "targetVisible", "eq", 1);
managerInst.AddMethodSubtask("guard", "guard_root", "m_chase", "chase_target");
managerInst.RegisterBuiltTaskNetwork("guard");

// Runtime control/query helpers
managerInst.SetWorldStateKey(guardUID, "health", 42);
managerInst.RequestPlan(guardUID);
managerInst.AssignAgentToSquad(guardUID, "alpha");
managerInst.AutoAssignNearestFreeSlot(guardUID, "alpha", "cover", 500, 300, 900, 1.2);
```

Combo parameters in script should use each ACE's expected value form (for example "interval_sec", "request", "minimum", or "0"/"1" for some yes-no combos).

### Reading state from script
Expressions are also ACE-exposed, so query methods are callable directly from script using PascalCase expression names.

Common query examples:
- TriggerAgentUID()
- CurrentTask()
- ActiveTask(agentUID)
- AlertLevel()
- CountAgents()
- GetAgentUIDByIndex(index)
- AgentSquad(agentUID)
- SlotOwner(squadId, slotType, slotId)

Event helper methods are also available:
- on(tag, callback, options)
- off(tag, callback)
- dispatch(tag)

Treat underscore-prefixed methods as internal implementation details.

### Listening to events from script
This addon exposes a custom event emitter style API via on/off.

```javascript
const onTask = () => {
  const uid = managerInst.TriggerAgentUID();
  const task = managerInst.CurrentTask();
  console.log("Task started", uid, task);
};

managerInst.on("OnPrimitiveTaskStarted", onTask);
```

### Looping patterns
Count plus index expressions map directly to loops:

```javascript
const total = managerInst.CountAgents();
for (let i = 0; i < total; i += 1) {
  const uid = managerInst.GetAgentUIDByIndex(i);
  const task = managerInst.ActiveTask(uid);
  console.log(uid, task);
}
```

### Scripting model notes
- This addon now uses ACE exposure as the single scripting source for both actions and expressions.
- If an ACE exists and is exposed, use its PascalCase method directly in script.
- Prefer ACE-exposed methods over internal runtime helpers for forward compatibility.

### Complete example
```javascript
function setupGuard(managerInst, uid, squadId, networkJson, scorerJson) {
  managerInst.RegisterTaskNetwork("guard", networkJson);
  managerInst.RegisterUtilityScorer(scorerJson);
  managerInst.AssignAgentToSquad(uid, squadId);
  managerInst.SetWorldStateKey(uid, "seed.aggression", 0.6);
  managerInst.RequestPlan(uid);

  managerInst.on("OnTaskFailed", () => {
    if (managerInst.TriggerAgentUID() === uid) {
      managerInst.ForceTask(uid, "fallback_idle");
    }
  });
}
```

## 23. Feature Deep-Dives
### Time Slicing Deep-Dive
- Use planningIntervalSec to define how often planning windows run.
- Use maxAgentsPerUpdate to bound breadth of each window.
- Use planningTimeSliceSec to bound time spent in a single window.

Recommended tuning order:
1. Set planning mode and interval.
2. Set max agents per update.
3. Add small time slice if spikes remain.

### Variant Seeding Deep-Dive
Keep one network per archetype, then differentiate instances with seeded keys.

Seed families:
- seed.aggression
- seed.riskTolerance
- seed.scanInterval
- seed.interruptBias

Use seed values in scorer curves, not only in event logic, to keep behavior coherent.

### Coordination Deep-Dive
Slot position sources:
1. Direct coordinates via Set Slot Position.
2. JSON array import via Load Slot Positions From JSON.
3. State key import via Load Slot Positions From World State Key.

Ownership model:
- Slot owner is exclusive while TTL is active.
- TTL expiration auto-releases slot.
- Auto assign picks nearest currently free slot.

## 24. Working with Companion Behavior Agent Addon
This manager is designed to pair cleanly with the companion behavior agent addon.

Companion behavior identity:
- Companion Addon ID: salmanshh_DHTN_Agent
- Manager Addon ID expected by companion: salmanshh_DHTN_manager

Primary integration split:
- Manager addon: planning, utility scoring, alert aggregation, squad coordination, slot ownership
- Companion behavior addon: per-instance orchestration, local signal forwarding, gameplay-side task execution bridge

### Recommended setup order
1. Add one instance of the manager plugin to the project.
2. Add the companion behavior to each AI-controlled object.
3. Choose your content-authoring path (behavior-driven builders or manager-direct builders).
4. Register all required task networks and utility scorers at startup.
5. Ensure each agent behavior has an agentType that maps to a registered manager network.
6. Feed world-state keys continuously from gameplay context.
7. Execute gameplay behavior when task triggers fire.
8. Mark task complete or failed from gameplay outcome.

### Content authoring paths
Use whichever path matches your team workflow.

Path A: behavior-driven builders (recommended for shared content libraries)
- Build task network JSON through behavior builder actions.
- Build slot sets through behavior slot-builder actions.
- Export to keys/assets and reuse across levels or projects.
- Register exported JSON with manager at runtime.

Path B: manager-direct builders (recommended for immediate setup and rapid iteration)
- Build utility scorers directly with manager `Builder:` actions.
- Build task networks directly with manager `Builder:` actions.
- Register immediately without separate JSON assets.

Both paths are valid and compatible with the same runtime plan/task flow.

### Event-sheet integration pattern (behavior-driven content path)
```text
Event: On start of layout
  // Behavior builds network content and exports JSON to a world-state key
  Action: AgentBehavior.InitializeTaskNetworkBuilder -> "guard"
  Action: AgentBehavior.AddTaskToNetworkBuilder -> "patrol", "guard", "Patrol route", "primitive"
  Action: AgentBehavior.AddTaskToNetworkBuilder -> "chase", "guard", "Pursue target", "primitive"
  Action: AgentBehavior.LoadTaskNetworkFromBuilder -> "guard", "guardNetworkJSON"

  // Manager registers exported JSON
  Action: Setup: Register Task Network -> "guard", AgentBehavior.WorldState("guardNetworkJSON")
  Action: Setup: Register Utility Scorer -> GuardCombatScorerJson
  Action: Setup: Register Utility Scorer -> GuardRetreatScorerJson

Event: Every tick (for each enemy)
  Action: AgentBehavior.SetWorldState -> "targetVisible", TargetVisible
  Action: AgentBehavior.SetWorldState -> "health", EnemyHealth
  Action: AgentBehavior.SetWorldState -> "distanceToTarget", DistToPlayer

Event: AgentBehavior.OnTaskStarted
  Condition: AgentBehavior.CurrentTask = "chase"
  Action: EnemyMoveTo.SetTarget -> Player.X, Player.Y

Event: Enemy reached target
  Action: AgentBehavior.MarkTaskComplete
```

### Event-sheet integration pattern (manager-direct builder path)
```text
Event: On start of layout
  Action: Builder: Begin Utility Scorer -> "guard_combat", Weighted sum
  Action: Builder: Add Utility Input (Linear) -> "guard_combat", "targetVisible", 1, No, 0,0,1,1
  Action: Builder: Register Utility Scorer -> "guard_combat"

  Action: Builder: Begin Task Network -> "guard", "guard_root"
  Action: Builder: Add Compound Task -> "guard", "guard_root"
  Action: Builder: Add Primitive Task -> "guard", "chase_target", "chase"
  Action: Builder: Add Method -> "guard", "guard_root", "m_chase"
  Action: Builder: Add Method Condition -> "guard", "guard_root", "m_chase", "targetVisible", ==, 1
  Action: Builder: Set Method Utility Scorer -> "guard", "guard_root", "m_chase", "guard_combat"
  Action: Builder: Add Method Subtask -> "guard", "guard_root", "m_chase", "chase_target"
  Action: Builder: Register Task Network -> "guard"
```

### Trigger ownership guidance
- Prefer behavior-level task triggers for per-object gameplay execution.
- Prefer manager-level squad/slot triggers for group coordination logic.
- Keep world-state key names identical between behavior writes and manager network/scorer definitions.

### Coordination with companion behavior
Use the manager for shared state and reservations, while behavior instances perform local movement and animation.

```text
Event: Leader picks flank tactic
  Action: Manager.Coordination Set Squad State Key -> "alpha", "squad.tactic", "flank_left"
  Action: Manager.Coordination Squad Plan Control -> Request Now, "alpha"

Event: Agent behavior receives updated task
  Action: Manager.Coordination Auto Assign Nearest Free Slot -> UID, "alpha", "flank", Self.X, Self.Y, 1000, 1.2
  Action: AgentBehavior.SetWorldState -> "assignedFlankSlot", Manager.AssignedSlotId(UID, "flank")
```

### Slot setup options with companion behavior
Option 1 (behavior slot builder flow)
- InitializeSlotBuilder(squadId, slotType)
- AddSlotToBuilder(squadId, slotType, slotId, x, y)
- LoadSlotSetFromBuilder(squadId, slotType)

Option 2 (manager coordination flow)
- Coordination: Set Slot Position
- Coordination: Load Slot Positions From JSON
- Coordination: Load Slot Positions From World State Key

Use option 1 for reusable content assets and option 2 for direct runtime control.

### Scripting pattern (manager + behavior)
```javascript
function wireAgent(runtime, agentInst, uid) {
  const manager = runtime.objects.TactiCoreManager.getFirstInstance();
  const ai = agentInst.behaviors.UtilityDrivenHTNAgent;

  ai.SetAgentType("guard");
  ai.SetEnabled(true);

  ai.on("OnTaskStarted", () => {
    const task = ai.CurrentTask();
    if (task === "chase") {
      // Gameplay movement handled by the behavior owner object.
      agentInst.instVars.MoveMode = "Chase";
    }
  });

  manager.on("OnSlotReleased", () => {
    if (manager.TriggerAgentUID() === uid) {
      manager.AutoAssignNearestFreeSlot(uid, "alpha", "cover", agentInst.x, agentInst.y, 800, 1);
    }
  });
}
```

### Companion integration contract
This guide is the primary integration reference. Use the following compact contract directly:
- Behavior-side responsibilities: register agent type, keep per-agent world state updated, execute gameplay for current task, and mark task completion or failure.
- Manager-side responsibilities: plan generation, scorer evaluation, alert aggregation, squad shared state, and slot reservation lifecycle.
- Shared compatibility contract: keep task IDs and world-state key names stable, use ACE-exposed methods as the script API surface, and avoid relying on underscore-prefixed internals.
- Scalability rule: for team projects, standardize one content path (behavior-driven builder exports or manager-direct builders) per project to avoid drift.

## 25. Tips and Common Mistakes
- Keep key naming consistent between JSON conditions and runtime writes.
- Do not request immediate replans every tick for all agents.
- Use invalidate for low-urgency changes and request-now for urgent switches.
- Always define slot positions before using auto-assign nearest slot.
- Use TTLs on reservations to avoid dead locks from stale ownership.
- Keep one archetype network per role and use variant seeds for diversity.
- Start with debug mode on during setup, then turn it off for release builds.
- In multiplayer, keep planner authority on host/server to avoid divergence.
- Do not rely on internal underscore methods as stable script API surface.
- Test save/load after changing world-state schema or coordination keys.
