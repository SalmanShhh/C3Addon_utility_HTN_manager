# Agent Addon Context Spec

This file defines the integration contract for the Utility-Driven HTN Agent behavior addon so a manager companion addon can interact with it safely and consistently.

## 1. Addon Identity
- Addon ID: salmanshh_DHTN_Agent
- Addon Name: Utility-Driven HTN (Hierarchical Task Network) Agent
- Addon Type: Behavior
- Scope: Per-object instance
- Primary Role: Runtime bridge between object gameplay logic and the global manager

## 2. Dependency Contract
- Required manager addon ID: salmanshh_DHTN_manager
- Manager lookup behavior: soft-fail, logs warning, processing suspended when not found
- Registration behavior: auto-register on create when Auto Register property is true
- Deregistration behavior: unregisters on destroy, with optional coordination slot cleanup

## 3. Architecture Summary
The behavior does not own HTN decomposition or utility scoring. It owns per-instance orchestration:
- manager registration lifecycle
- periodic planning requests based on mode and interval
- current task tracking and task transition triggers
- world-state convenience writes
- signal to stimulus conversion
- temporary task overrides
- squad coordination mirror and slot controls

## 4. Per-Agent Runtime State
Each behavior instance tracks:
- uid (number)
- agentType (string)
- planningMode (reactive | deliberate | hybrid)
- planningIntervalSec (number)
- urgencyThreshold (0..1)
- alertLevel (0..1)
- alertTier and previousTier (0..3)
- task fields (currentTask, previousTask, completedTask, failedTask, restoredTask)
- stimulus fields (type, x, y, intensity)
- temporary task fields (id, duration, timer, snapshot)
- enabled and paused flags
- local world-state proxy usage through manager methods

## 5. Planning Lifecycle Contract
1. Behavior registers itself with manager (optional auto flow).
2. Behavior feeds context via world-state keys and signals.
3. Behavior requests plan immediately or on interval according to planning mode.
4. Behavior polls manager active task and emits task triggers.
5. Gameplay layer executes primitive behavior externally.
6. Gameplay layer calls Mark Task Complete or Mark Task Failed.

## 6. World-State Contract
Write helpers:
- SetWorldState(key, value)
- ClearWorldStateKey(key)
- SetPatrolPoint(index, x, y)
- SetTarget(targetUID, x, y)
- ClearTarget()

Read helpers:
- WorldState(key)
- TargetUID()
- LastKnownX()
- LastKnownY()

Schema guidance:
- Keep key names stable across manager networks and behavior usage.
- Use primitive values (number/string/boolean-like) where possible.
- Treat key naming as API, not temporary implementation detail.

## 7. Signal and Alert Contract
Signals map gameplay events to manager stimuli and local key updates:
- SignalTargetSeen(targetUID, x, y, confidence)
- SignalTargetLost()
- SignalSoundHeard(x, y, intensity)
- SignalDamaged(damage, fromX, fromY)

Alert tiers:
- 0: unaware
- 1: suspicious
- 2: alerted
- 3: combat

Important behavior:
- SignalDamaged forces immediate replan request.
- SignalTargetLost only flips targetVisible, it does not clear full target fields.

## 8. Coordination Contract
Shared coordination storage supports:
- squad membership and leader assignment
- squad shared key-value state
- slot definition and reservation with TTL
- nearest-slot auto assignment
- grouped squad plan invalidation/request flow

Core actions:
- AssignAgentToSquad(agentUID, squadId)
- RemoveAgentFromSquad(agentUID)
- SetSquadLeader(squadId, agentUID)
- SetSquadStateKey(squadId, key, value)
- ClearSquadStateKey(squadId, key)
- ReserveSlot(squadId, slotType, slotId, agentUID, ttlSec)
- ReleaseSlot(squadId, slotType, slotId)
- SetSlotPosition(squadId, slotType, slotId, x, y)
- AutoAssignNearestFreeSlot(agentUID, squadId, slotType, agentX, agentY, maxDistance, ttlSec)
- SquadPlanControl(mode, squadId)

## 9. Performance Contract
Per-instance controls:
- SetEnabled(enabled)
- SetPlanningMode(mode)
- SetPlanningInterval(seconds)
- SetProcessingInterval(seconds)
- SetTaskTimeout(seconds)
- Pause()
- Resume()

Global coordination controls:
- SetCoordinationEnabled(enabled)
- SetCoordinationUpdateInterval(seconds)
- SetCoordinationMaxSquadsPerUpdate(count)
- SetCoordinationTimeSlice(seconds)
- SetCoordinationSlotDefaultTtl(seconds)
- SetCoordinationAutoReleaseOnDeregister(enabled)

Guidance:
- Use deliberate mode and larger intervals for background agents.
- Avoid forcing RequestReplan every tick unless strict responsiveness is required.

## 10. Save/Load Contract
Behavior persists key runtime fields via save/load:
- planning settings
- alert/task/stimulus fields
- enabled/paused and temporary task state
- squad membership context

Compatibility guidance:
- Keep task IDs and key schema backward-compatible for old saves.
- Avoid relying on internal underscore methods from external integrations.

## 11. Scripting API Surface
Single source of script API is ACE exposure on actions, conditions, and expressions.

Write/control examples:
- SetEnabled(enabled)
- SetAgentType(agentType)
- SetPlanningMode(mode)
- SetWorldState(key, value)
- SignalTargetSeen(targetUID, x, y, confidence)
- MarkTaskComplete()
- MarkTaskFailed()
- RequestReplan()
- AssignAgentToSquad(agentUID, squadId)
- ReserveSlot(squadId, slotType, slotId, agentUID, ttlSec)

Read/query examples:
- CurrentTask()
- PreviousTask()
- AlertLevel()
- AlertTier()
- AlertTierName()
- HasTarget()
- IsEnabled()
- PlanLength()
- PlanTaskAtIndex(index)
- SquadMemberCount(squadId)

Event helpers:
- on(tag, callback, options)
- off(tag, callback)
- dispatch(tag)

Notes:
- Combo parameters should use combo key strings in script calls.
- Underscore-prefixed methods are internal and unstable.

## 12. Trigger/Event Contract
Primary triggers exposed by the behavior:
- OnTaskStarted
- OnTaskCompleted
- OnTaskFailed
- OnAlertChanged
- OnStimulusReceived
- OnTemporaryTaskStarted
- OnTemporaryTaskEnded
- OnSquadStateChanged
- OnSlotReserved
- OnSlotReleased
- OnSquadMembershipChanged

Guidance:
- Read expressions immediately in trigger callbacks to capture event-time context.

## 13. Companion Responsibilities When Using This Behavior
Manager companion addon should:
- ensure required task networks/scorers are registered for every used agentType
- keep world-state inputs current through this behavior API
- subscribe to behavior task/alert/squad triggers for gameplay dispatch
- execute concrete movement/combat/animation outside this behavior
- call completion/failure actions promptly to prevent task stalls

## 14. Integration Pattern Example
```javascript
function wireEnemy(runtime, enemy) {
  const ai = enemy.behaviors.UtilityDrivenHTNAgent;

  ai.SetEnabled(true);
  ai.SetAgentType("guard");
  ai.SetPlanningMode("hybrid");
  ai.SetPlanningInterval(0.75);

  ai.on("OnTaskStarted", () => {
    const task = ai.CurrentTask();

    if (task === "patrol") {
      enemy.instVars.Speed = 120;
    }
    if (task === "chase") {
      enemy.instVars.Speed = 220;
    }
  });

  ai.on("OnStimulusReceived", () => {
    if (ai.StimulusType() === "audio") {
      ai.RequestReplan();
    }
  });
}
```

## 15. Compatibility and Versioning Guidance
- Treat task IDs, squad IDs, and world-state key names as stable contracts.
- Add new behavior keys and task branches in backward-compatible ways.
- Prefer ACE-exposed methods only.
- Do not depend on internal underscore methods.

## 16. Quick Checklist
- Manager instance exists on layout.
- Agent objects include this behavior.
- Agent Type values map to existing manager networks.
- World-state keys needed by scoring are continuously maintained.
- Task execution branches call Mark Task Complete or Mark Task Failed.
- Coordination reservations are released or allowed to expire with TTL.
