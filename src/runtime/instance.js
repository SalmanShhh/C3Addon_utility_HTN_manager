import { id, addonType } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";

const ALERT_TIER_NAMES = ["unaware", "suspicious", "alerted", "combat"];

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();
      this._setTicking(true);

      const properties = this._getInitProperties() ?? [];
      this._enabled = properties[0] !== false;
      this._debugMode = !!properties[1];
      this._planningMode = properties[2] ?? "per_frame";
      this._planningIntervalSec = Math.max(0.01, Number(properties[3] ?? 0.1));
      this._maxAgentsPerTick = Math.max(0, Math.floor(Number(properties[4] ?? 0)));
      this._planningTimeSliceSec = Math.max(0, Number(properties[5] ?? 0));
      this._interruptThreshold = this._clamp01(Number(properties[6] ?? 0.75));
      this._maxPlanDepth = Math.max(1, Math.floor(Number(properties[7] ?? 20)));
      this._alertDecayRate = Math.max(0, Number(properties[8] ?? 0.05));
      this._alertTierThresholds = [
        this._clamp01(Number(properties[9] ?? 0.25)),
        this._clamp01(Number(properties[10] ?? 0.55)),
        this._clamp01(Number(properties[11] ?? 0.8)),
      ];

      this.events = {};
      this._taskNetworks = new Map();
      this._utilityScorers = new Map();
      this._taskNetworkBuilders = new Map();
      this._utilityScorerBuilders = new Map();
      this._agents = new Map();
      this._agentOrder = [];
      this._globalState = {};
      this._squads = new Map();
      this._agentSquads = new Map();
      this._agentAssignedSlots = new Map();
      this._planningAccumulator = 0;
      this._planningCursor = 0;

      this._lastRegisteredAgentType = "";
      this._lastTriggerAgentUID = 0;
      this._lastCurrentTask = "";
      this._lastPreviousTask = "";
      this._lastCompletedTask = "";
      this._lastFailedTask = "";
      this._lastFailedCompoundTask = "";
      this._lastInterruptedTask = "";
      this._lastNewTask = "";
      this._lastInterruptScore = 0;
      this._lastAlertTierIndex = 0;
      this._lastAlertTierName = ALERT_TIER_NAMES[0];
      this._lastAlertLevel = 0;
      this._lastPreviousTierIndex = 0;
      this._lastStimulusType = "";
      this._lastStimulusX = 0;
      this._lastStimulusY = 0;
      this._lastStimulusIntensity = 0;
      this._lastPlanLength = 0;
      this._lastPlanResult = "";
      this._lastCoordinationSquadId = "";
      this._lastCoordinationAgentUID = 0;
      this._lastCoordinationKey = "";
      this._lastCoordinationSlotType = "";
      this._lastCoordinationSlotId = "";
      this._lastCoordinationSlotOwner = 0;
    }

    _trigger(method) {
      this.dispatch(method);
      super._trigger(self.C3[AddonTypeMap[addonType]][id].Cnds[method]);
    }

    on(tag, callback, options) {
      if (!this.events[tag]) {
        this.events[tag] = [];
      }
      this.events[tag].push({ callback, options });
    }

    off(tag, callback) {
      if (this.events[tag]) {
        this.events[tag] = this.events[tag].filter(
          (event) => event.callback !== callback
        );
      }
    }

    dispatch(tag) {
      if (this.events[tag]) {
        this.events[tag].forEach((event) => {
          // Optional condition-gating lets script listeners mirror C3 trigger filters.
          if (event.options && event.options.params) {
            const fn = self.C3[AddonTypeMap[addonType]][id].Cnds[tag];
            if (fn && !fn.call(this, ...event.options.params)) {
              return;
            }
          }
          event.callback();
          if (event.options && event.options.once) {
            this.off(tag, event.callback);
          }
        });
      }
    }

    _tick() {
      if (!this._enabled) {
        return;
      }

      const dt = Math.max(0, Number(this.runtime?.dt ?? 0));
      this._updateStimuli(dt);
      this._updateAlertDecay(dt);
      this._releaseExpiredSlots();

      if (this._planningMode === "interval_sec") {
        this._planningAccumulator += dt;
        const interval = this._planningIntervalSec;
        if (this._planningAccumulator >= interval) {
          this._planningAccumulator = 0;
          this._processPlanningQueue();
        }
        return;
      }

      this._processPlanningQueue();
    }

    _release() {
      super._release();
    }

    _saveToJson() {
      return {
        taskNetworks: [...this._taskNetworks.entries()],
        utilityScorers: [...this._utilityScorers.entries()],
        agents: [...this._agents.entries()].map(([uid, agent]) => [
          uid,
          {
            uid: agent.uid,
            agentType: agent.agentType,
            alertBaseLevel: agent.alertBaseLevel,
            alertLevel: agent.alertLevel,
            alertTierIndex: agent.alertTierIndex,
            worldState: agent.worldState,
            stimuli: agent.stimuli,
            plan: agent.plan,
            activeTask: agent.activeTask,
            previousTask: agent.previousTask,
            paused: agent.paused,
            planStale: agent.planStale,
          },
        ]),
        agentOrder: this._agentOrder,
        globalState: this._globalState,
        squads: this._serializeSquads(),
        agentSquads: [...this._agentSquads.entries()],
        agentAssignedSlots: [...this._agentAssignedSlots.entries()],
        enabled: this._enabled,
        debugMode: this._debugMode,
        planningMode: this._planningMode,
        planningIntervalSec: this._planningIntervalSec,
        maxAgentsPerTick: this._maxAgentsPerTick,
        planningTimeSliceSec: this._planningTimeSliceSec,
        lastPlanResult: this._lastPlanResult,
      };
    }

    _loadFromJson(o) {
      this._taskNetworks = new Map(o?.taskNetworks ?? []);
      this._utilityScorers = new Map(o?.utilityScorers ?? []);
      this._agents = new Map(
        (o?.agents ?? []).map(([uid, agent]) => [uid, this._hydrateAgent(agent)])
      );
      this._agentOrder = Array.isArray(o?.agentOrder) ? o.agentOrder.slice() : [];
      this._globalState = { ...(o?.globalState ?? {}) };
      this._squads = this._deserializeSquads(o?.squads ?? []);
      this._agentSquads = new Map(o?.agentSquads ?? []);
      this._agentAssignedSlots = new Map(o?.agentAssignedSlots ?? []);
      this._enabled = o?.enabled !== false;
      this._debugMode = !!o?.debugMode;
      this._planningMode = o?.planningMode ?? this._planningMode;
      this._planningIntervalSec = Math.max(
        0.01,
        Number(o?.planningIntervalSec ?? this._planningIntervalSec)
      );
      this._maxAgentsPerTick = Math.max(
        0,
        Math.floor(Number(o?.maxAgentsPerTick ?? this._maxAgentsPerTick))
      );
      this._planningTimeSliceSec = Math.max(
        0,
        Number(o?.planningTimeSliceSec ?? this._planningTimeSliceSec)
      );
      this._lastPlanResult = o?.lastPlanResult ?? "";
    }

    _hydrateAgent(agent) {
      return {
        uid: agent.uid,
        agentType: agent.agentType,
        alertBaseLevel: Number(agent.alertBaseLevel ?? 0),
        alertLevel: Number(agent.alertLevel ?? 0),
        alertTierIndex: Number(agent.alertTierIndex ?? 0),
        worldState: { ...(agent.worldState ?? {}) },
        stimuli: Array.isArray(agent.stimuli) ? agent.stimuli.slice() : [],
        plan: Array.isArray(agent.plan) ? agent.plan.slice() : [],
        activeTask: agent.activeTask ?? "",
        previousTask: agent.previousTask ?? "",
        paused: !!agent.paused,
        planStale: !!agent.planStale,
      };
    }

    _processPlanningQueue() {
      const total = this._agentOrder.length;
      if (!total) {
        return;
      }

      // Supports full-pass updates and budgeted round-robin processing for frame stability.
      const processAll = this._maxAgentsPerTick <= 0 || this._maxAgentsPerTick >= total;
      const budget = processAll ? total : this._maxAgentsPerTick;
      const useTimeSlice = this._planningTimeSliceSec > 0;
      const sliceStartSec = this._nowSec();

      let processed = 0;
      while (processed < budget) {
        if (processed > 0 && useTimeSlice) {
          const elapsed = this._nowSec() - sliceStartSec;
          if (elapsed >= this._planningTimeSliceSec) {
            break;
          }
        }

        if (this._planningCursor >= total) {
          this._planningCursor = 0;
        }

        // Cursor state is preserved across ticks so no subset of agents is starved.
        const uid = this._agentOrder[this._planningCursor];
        this._planningCursor += 1;
        processed += 1;

        const agent = this._agents.get(uid);
        if (!agent || agent.paused) {
          continue;
        }

        if (!agent.plan.length || agent.planStale) {
          this._requestPlan(uid);
        }
      }
    }

    _registerAgent(uid, agentType, initialAlertLevel = 0) {
      const numericUID = Number(uid);
      const agent = this._agents.get(numericUID) ?? {
        uid: numericUID,
        agentType: String(agentType ?? ""),
        alertBaseLevel: 0,
        alertLevel: 0,
        alertTierIndex: 0,
        worldState: {},
        stimuli: [],
        plan: [],
        activeTask: "",
        previousTask: "",
        paused: false,
        planStale: true,
      };

      agent.agentType = String(agentType ?? agent.agentType ?? "");
      agent.alertBaseLevel = this._clamp01(Number(initialAlertLevel ?? agent.alertBaseLevel));
      agent.planStale = true;
      agent.worldState.alertLevel = agent.alertBaseLevel;
      agent.worldState.alertTier = this._getAlertTierIndexFromLevel(agent.alertBaseLevel);
      agent.worldState.alertTierName = ALERT_TIER_NAMES[agent.worldState.alertTier];
      this._syncAlertState(agent);

      this._agents.set(numericUID, agent);
      if (!this._agentOrder.includes(numericUID)) {
        this._agentOrder.push(numericUID);
      }

      return numericUID;
    }

    _deregisterAgent(uid) {
      const numericUID = Number(uid);
      this._removeAgentFromSquad(numericUID);
      this._agents.delete(numericUID);
      this._agentOrder = this._agentOrder.filter((entry) => entry !== numericUID);
    }

    _getOrCreateSquad(squadId) {
      const key = String(squadId ?? "");
      let squad = this._squads.get(key);
      if (!squad) {
        squad = {
          id: key,
          leaderUID: 0,
          members: new Set(),
          state: {},
          slots: new Map(),
          slotPoints: new Map(),
        };
        this._squads.set(key, squad);
      }
      return squad;
    }

    _assignAgentToSquad(uid, squadId) {
      const numericUID = Number(uid);
      const key = String(squadId ?? "").trim();
      if (!key) {
        return false;
      }

      this._removeAgentFromSquad(numericUID);
      const squad = this._getOrCreateSquad(key);
      squad.members.add(numericUID);
      this._agentSquads.set(numericUID, key);

      const agent = this._agents.get(numericUID);
      if (agent) {
        agent.worldState["squad.id"] = key;
      }

      this._lastCoordinationSquadId = key;
      this._lastCoordinationAgentUID = numericUID;
      this._trigger("OnSquadMembershipChanged");
      return true;
    }

    _removeAgentFromSquad(uid) {
      const numericUID = Number(uid);
      const squadId = this._agentSquads.get(numericUID);
      if (!squadId) {
        return false;
      }

      const squad = this._squads.get(squadId);
      if (squad) {
        squad.members.delete(numericUID);
        if (squad.leaderUID === numericUID) {
          squad.leaderUID = [...squad.members][0] ?? 0;
        }
        this._releaseAllSlotsByAgentInSquad(squad, numericUID);
        if (
          !squad.members.size &&
          !Object.keys(squad.state).length &&
          !squad.slots.size &&
          !squad.slotPoints.size
        ) {
          this._squads.delete(squadId);
        }
      }

      this._agentSquads.delete(numericUID);
      this._agentAssignedSlots.delete(numericUID);

      const agent = this._agents.get(numericUID);
      if (agent) {
        delete agent.worldState["squad.id"];
      }

      this._lastCoordinationSquadId = squadId;
      this._lastCoordinationAgentUID = numericUID;
      this._trigger("OnSquadMembershipChanged");
      return true;
    }

    _setSquadLeader(squadId, uid) {
      const squad = this._getOrCreateSquad(squadId);
      const numericUID = Number(uid);
      if (!squad.members.has(numericUID)) {
        squad.members.add(numericUID);
        this._agentSquads.set(numericUID, squad.id);
      }

      squad.leaderUID = numericUID;
      this._lastCoordinationSquadId = squad.id;
      this._lastCoordinationAgentUID = numericUID;
      this._trigger("OnSquadStateChanged");
      return true;
    }

    _setSquadStateKey(squadId, key, value) {
      const squad = this._getOrCreateSquad(squadId);
      const stateKey = String(key ?? "");
      if (!stateKey) {
        return false;
      }

      const previous = squad.state[stateKey];
      squad.state[stateKey] = value;
      if (previous !== value) {
        this._lastCoordinationSquadId = squad.id;
        this._lastCoordinationKey = stateKey;
        this._trigger("OnSquadStateChanged");
      }
      return true;
    }

    _clearSquadStateKey(squadId, key) {
      const squad = this._squads.get(String(squadId ?? ""));
      if (!squad) {
        return false;
      }

      const stateKey = String(key ?? "");
      if (!Object.prototype.hasOwnProperty.call(squad.state, stateKey)) {
        return false;
      }

      delete squad.state[stateKey];
      this._lastCoordinationSquadId = squad.id;
      this._lastCoordinationKey = stateKey;
      this._trigger("OnSquadStateChanged");
      return true;
    }

    _reserveSlot(squadId, slotType, slotId, uid, ttlSec = 1) {
      const squad = this._getOrCreateSquad(squadId);
      const type = String(slotType ?? "").trim();
      const id = String(slotId ?? "").trim();
      const ownerUID = Number(uid);
      if (!type || !id || !ownerUID) {
        return false;
      }

      const now = this._nowSec();
      const ttl = Math.max(0, Number(ttlSec ?? 0));
      const expiresAtSec = ttl <= 0 ? now : now + ttl;

      let typeMap = squad.slots.get(type);
      if (!typeMap) {
        typeMap = new Map();
        squad.slots.set(type, typeMap);
      }

      const current = typeMap.get(id);
      if (current && current.ownerUID !== ownerUID && current.expiresAtSec > now) {
        return false;
      }

      typeMap.set(id, {
        ownerUID,
        reservedAtSec: now,
        expiresAtSec,
      });

      if (!this._agentAssignedSlots.has(ownerUID)) {
        this._agentAssignedSlots.set(ownerUID, {});
      }
      const assigned = this._agentAssignedSlots.get(ownerUID);
      assigned[type] = id;

      const agent = this._agents.get(ownerUID);
      if (agent) {
        agent.worldState[`squad.slot.${type}`] = id;
      }

      this._lastCoordinationSquadId = squad.id;
      this._lastCoordinationAgentUID = ownerUID;
      this._lastCoordinationSlotType = type;
      this._lastCoordinationSlotId = id;
      this._lastCoordinationSlotOwner = ownerUID;
      this._trigger("OnSlotReserved");
      return true;
    }

    _setSlotPosition(squadId, slotType, slotId, x, y) {
      const squad = this._getOrCreateSquad(squadId);
      const type = String(slotType ?? "").trim();
      const id = String(slotId ?? "").trim();
      if (!type || !id) {
        return false;
      }

      let typeMap = squad.slotPoints.get(type);
      if (!typeMap) {
        typeMap = new Map();
        squad.slotPoints.set(type, typeMap);
      }

      typeMap.set(id, { x: Number(x ?? 0), y: Number(y ?? 0) });
      return true;
    }

    _loadSlotPositionsFromJson(squadId, slotType, slotsJson) {
      const parsed = this._parseJson(slotsJson);
      if (!parsed) {
        return 0;
      }
      return this._loadSlotPositionsFromRaw(squadId, slotType, parsed);
    }

    _loadSlotPositionsFromWorldStateKey(squadId, slotType, scope, key, agentUID = 0) {
      const valueKey = String(key ?? "");
      if (!valueKey) {
        return 0;
      }

      const valueScope = String(scope ?? "global");
      let raw = null;
      if (valueScope === "agent") {
        const agent = this._agents.get(Number(agentUID));
        raw = agent?.worldState?.[valueKey] ?? null;
      } else {
        raw = this._globalState[valueKey] ?? null;
      }

      if (typeof raw === "string") {
        raw = this._parseJson(raw);
      }
      if (!raw) {
        return 0;
      }

      return this._loadSlotPositionsFromRaw(squadId, slotType, raw);
    }

    _loadSlotPositionsFromRaw(squadId, slotType, raw) {
      // Accept both direct arrays and wrapped payloads ({ slots: [...] }) from data pipelines.
      const entries = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.slots)
          ? raw.slots
          : [];

      let loaded = 0;
      for (const entry of entries) {
        const slotId = String(entry?.id ?? entry?.slotId ?? "").trim();
        if (!slotId) {
          continue;
        }
        const x = Number(entry?.x ?? 0);
        const y = Number(entry?.y ?? 0);
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          continue;
        }
        if (this._setSlotPosition(squadId, slotType, slotId, x, y)) {
          loaded += 1;
        }
      }

      return loaded;
    }

    _autoAssignNearestFreeSlot(
      agentUID,
      squadId,
      slotType,
      agentX,
      agentY,
      maxDistance = 0,
      ttlSec = 1
    ) {
      const squad = this._squads.get(String(squadId ?? ""));
      if (!squad) {
        return "";
      }

      const type = String(slotType ?? "").trim();
      const points = squad.slotPoints.get(type);
      if (!points || !points.size) {
        return "";
      }

      const originX = Number(agentX ?? 0);
      const originY = Number(agentY ?? 0);
      const maxDist = Math.max(0, Number(maxDistance ?? 0));
      const maxDistSq = maxDist > 0 ? maxDist * maxDist : 0;

      let bestSlotId = "";
      let bestDistSq = Number.POSITIVE_INFINITY;
      // Sorted iteration keeps tie behavior deterministic between runs.
      const sorted = [...points.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      for (const [slotId, point] of sorted) {
        if (!this._isSlotFree(squad.id, type, slotId)) {
          continue;
        }
        const dx = Number(point.x) - originX;
        const dy = Number(point.y) - originY;
        const distSq = dx * dx + dy * dy;
        if (maxDistSq > 0 && distSq > maxDistSq) {
          continue;
        }
        if (distSq < bestDistSq) {
          bestDistSq = distSq;
          bestSlotId = slotId;
        }
      }

      if (!bestSlotId) {
        return "";
      }

      return this._reserveSlot(squad.id, type, bestSlotId, agentUID, ttlSec)
        ? bestSlotId
        : "";
    }

    _setSlotReservation(mode, squadId, slotType, slotId, agentUID, ttlSec) {
      const operation = String(mode ?? "reserve");
      if (operation === "release") {
        return this._releaseSlot(squadId, slotType, slotId);
      }
      return this._reserveSlot(squadId, slotType, slotId, agentUID, ttlSec);
    }

    _releaseSlot(squadId, slotType, slotId) {
      const squad = this._squads.get(String(squadId ?? ""));
      if (!squad) {
        return false;
      }

      const type = String(slotType ?? "").trim();
      const id = String(slotId ?? "").trim();
      const typeMap = squad.slots.get(type);
      if (!typeMap || !typeMap.has(id)) {
        return false;
      }

      const released = typeMap.get(id);
      typeMap.delete(id);
      if (!typeMap.size) {
        squad.slots.delete(type);
      }

      const assigned = this._agentAssignedSlots.get(released.ownerUID);
      if (assigned && assigned[type] === id) {
        delete assigned[type];
      }

      const agent = this._agents.get(released.ownerUID);
      if (agent) {
        delete agent.worldState[`squad.slot.${type}`];
      }

      this._lastCoordinationSquadId = squad.id;
      this._lastCoordinationAgentUID = released.ownerUID;
      this._lastCoordinationSlotType = type;
      this._lastCoordinationSlotId = id;
      this._lastCoordinationSlotOwner = 0;
      this._trigger("OnSlotReleased");
      return true;
    }

    _releaseAllSlotsByAgentInSquad(squad, uid) {
      for (const [slotType, typeMap] of squad.slots.entries()) {
        for (const [slotId, slot] of typeMap.entries()) {
          if (slot.ownerUID === uid) {
            typeMap.delete(slotId);
          }
        }
        if (!typeMap.size) {
          squad.slots.delete(slotType);
        }
      }
    }

    _releaseExpiredSlots() {
      const now = this._nowSec();
      for (const [squadId, squad] of this._squads.entries()) {
        for (const [slotType, typeMap] of squad.slots.entries()) {
          for (const [slotId, slot] of typeMap.entries()) {
            // Expired reservations emit the same trigger/context shape as manual release.
            if (slot.expiresAtSec <= now) {
              typeMap.delete(slotId);
              const assigned = this._agentAssignedSlots.get(slot.ownerUID);
              if (assigned && assigned[slotType] === slotId) {
                delete assigned[slotType];
              }

              const agent = this._agents.get(slot.ownerUID);
              if (agent) {
                delete agent.worldState[`squad.slot.${slotType}`];
              }

              this._lastCoordinationSquadId = squadId;
              this._lastCoordinationAgentUID = slot.ownerUID;
              this._lastCoordinationSlotType = slotType;
              this._lastCoordinationSlotId = slotId;
              this._lastCoordinationSlotOwner = 0;
              this._trigger("OnSlotReleased");
            }
          }
          if (!typeMap.size) {
            squad.slots.delete(slotType);
          }
        }
      }
    }

    _isAgentInSquad(uid, squadId) {
      return this._agentSquads.get(Number(uid)) === String(squadId ?? "");
    }

    _isSquadLeader(uid) {
      const squadId = this._agentSquads.get(Number(uid));
      if (!squadId) {
        return false;
      }
      return this._squads.get(squadId)?.leaderUID === Number(uid);
    }

    _isSlotFree(squadId, slotType, slotId) {
      const squad = this._squads.get(String(squadId ?? ""));
      if (!squad) {
        return true;
      }
      const typeMap = squad.slots.get(String(slotType ?? ""));
      if (!typeMap) {
        return true;
      }
      const slot = typeMap.get(String(slotId ?? ""));
      if (!slot) {
        return true;
      }
      return slot.expiresAtSec <= this._nowSec();
    }

    _getAgentSquad(uid) {
      return this._agentSquads.get(Number(uid)) ?? "";
    }

    _getSquadLeader(squadId) {
      return this._squads.get(String(squadId ?? ""))?.leaderUID ?? 0;
    }

    _getSquadStateValue(squadId, key) {
      const squad = this._squads.get(String(squadId ?? ""));
      if (!squad) {
        return 0;
      }
      return squad.state[String(key ?? "")] ?? 0;
    }

    _countSquadAgents(squadId) {
      return this._squads.get(String(squadId ?? ""))?.members.size ?? 0;
    }

    _getSquadAgentUIDByIndex(squadId, index) {
      const members = [...(this._squads.get(String(squadId ?? ""))?.members ?? [])];
      return members[Number(index)] ?? 0;
    }

    _getSlotOwner(squadId, slotType, slotId) {
      const squad = this._squads.get(String(squadId ?? ""));
      if (!squad) {
        return 0;
      }
      const slot = squad.slots.get(String(slotType ?? ""))?.get(String(slotId ?? ""));
      if (!slot || slot.expiresAtSec <= this._nowSec()) {
        return 0;
      }
      return slot.ownerUID;
    }

    _getAssignedSlotId(uid, slotType) {
      return this._agentAssignedSlots.get(Number(uid))?.[String(slotType ?? "")] ?? "";
    }

    _countSquads() {
      return this._squads.size;
    }

    _invalidateSquadPlans(squadId) {
      const squad = this._squads.get(String(squadId ?? ""));
      if (!squad) {
        return false;
      }

      for (const uid of squad.members) {
        const agent = this._agents.get(uid);
        if (agent) {
          agent.planStale = true;
        }
      }
      return true;
    }

    _requestSquadPlans(squadId) {
      const squad = this._squads.get(String(squadId ?? ""));
      if (!squad) {
        return false;
      }

      let any = false;
      for (const uid of squad.members) {
        any = this._requestPlan(uid) || any;
      }
      return any;
    }

    _squadPlanControl(mode, squadId) {
      const operation = String(mode ?? "invalidate");
      if (operation === "request") {
        return this._requestSquadPlans(squadId);
      }
      return this._invalidateSquadPlans(squadId);
    }

    _serializeSquads() {
      return [...this._squads.entries()].map(([id, squad]) => [
        id,
        {
          leaderUID: squad.leaderUID,
          members: [...squad.members],
          state: squad.state,
          slots: [...squad.slots.entries()].map(([slotType, typeMap]) => [
            slotType,
            [...typeMap.entries()],
          ]),
          slotPoints: [...squad.slotPoints.entries()].map(([slotType, typeMap]) => [
            slotType,
            [...typeMap.entries()],
          ]),
        },
      ]);
    }

    _deserializeSquads(serialized) {
      const result = new Map();
      for (const [id, squad] of serialized) {
        const slots = new Map(
          (squad.slots ?? []).map(([slotType, values]) => [slotType, new Map(values)])
        );
        const slotPoints = new Map(
          (squad.slotPoints ?? []).map(([slotType, values]) => [slotType, new Map(values)])
        );
        result.set(id, {
          id,
          leaderUID: Number(squad.leaderUID ?? 0),
          members: new Set(squad.members ?? []),
          state: { ...(squad.state ?? {}) },
          slots,
          slotPoints,
        });
      }
      return result;
    }

    _markTaskComplete(uid) {
      const agent = this._agents.get(Number(uid));
      if (!agent || !agent.plan.length) {
        return;
      }

      const completedTask = agent.plan.shift() ?? "";
      agent.previousTask = completedTask;
      agent.activeTask = agent.plan[0] ?? "";
      agent.planStale = false;

      this._lastTriggerAgentUID = agent.uid;
      this._lastCompletedTask = completedTask;
      this._trigger("OnTaskCompleted");

      if (agent.activeTask) {
        this._lastTriggerAgentUID = agent.uid;
        this._lastCurrentTask = agent.activeTask;
        this._lastPreviousTask = completedTask;
        this._lastPlanLength = agent.plan.length;
        this._trigger("OnPrimitiveTaskStarted");
      }
    }

    _markTaskFailed(uid) {
      const agent = this._agents.get(Number(uid));
      if (!agent) {
        return;
      }

      const failedTask = agent.activeTask || agent.plan[0] || "";
      agent.plan = [];
      agent.activeTask = "";
      agent.planStale = true;

      this._lastTriggerAgentUID = agent.uid;
      this._lastFailedTask = failedTask;
      this._trigger("OnTaskFailed");
    }

    _requestPlan(uid) {
      const agent = this._agents.get(Number(uid));
      if (!agent) {
        return false;
      }

      const network = this._taskNetworks.get(agent.agentType);
      if (!network) {
        agent.plan = [];
        agent.activeTask = "";
        agent.planStale = false;
        this._lastTriggerAgentUID = agent.uid;
        this._lastFailedCompoundTask = "";
        this._lastPlanResult = "failed";
        this._trigger("OnPlanFailed");
        return false;
      }

      const plan = this._decomposeTask(agent, network.root, 0);
      if (!plan || !plan.length) {
        agent.plan = [];
        agent.activeTask = "";
        agent.planStale = false;
        this._lastTriggerAgentUID = agent.uid;
        this._lastFailedCompoundTask = network.root ?? "";
        this._lastPlanResult = "failed";
        this._trigger("OnPlanFailed");
        return false;
      }

      const previousTask = agent.activeTask;
      agent.plan = plan.slice();
      agent.activeTask = agent.plan[0] ?? "";
      agent.planStale = false;
      agent.previousTask = previousTask;

      this._lastTriggerAgentUID = agent.uid;
      this._lastCurrentTask = agent.activeTask;
      this._lastPreviousTask = previousTask;
      this._lastPlanLength = agent.plan.length;
      this._lastPlanResult = "success";
      this._trigger("OnPrimitiveTaskStarted");
      return true;
    }

    _forceTask(uid, taskId) {
      const agent = this._agents.get(Number(uid));
      if (!agent) {
        return;
      }

      const nextTask = String(taskId ?? "");
      const previousTask = agent.activeTask;
      agent.plan = [nextTask, ...agent.plan.filter((entry) => entry !== nextTask)];
      agent.activeTask = nextTask;
      agent.planStale = false;

      this._lastTriggerAgentUID = agent.uid;
      this._lastCurrentTask = nextTask;
      this._lastPreviousTask = previousTask;
      this._lastPlanLength = agent.plan.length;
      this._lastPlanResult = "success";
      this._trigger("OnPrimitiveTaskStarted");
    }

    _pausePlanning(uid) {
      const agent = this._agents.get(Number(uid));
      if (agent) {
        agent.paused = true;
      }
    }

    _resumePlanning(uid) {
      const agent = this._agents.get(Number(uid));
      if (agent) {
        agent.paused = false;
        agent.planStale = true;
      }
    }

    _clearPlan(uid) {
      const agent = this._agents.get(Number(uid));
      if (!agent) {
        return;
      }

      agent.plan = [];
      agent.activeTask = "";
      agent.planStale = false;
    }

    _setWorldStateKey(uid, key, value) {
      const agent = this._agents.get(Number(uid));
      if (!agent) {
        return;
      }

      agent.worldState[String(key)] = value;
      if (String(key) === "alertLevel") {
        this._setAlertLevel(uid, value);
      } else {
        agent.planStale = true;
      }
    }

    _setGlobalStateKey(key, value) {
      this._globalState[String(key)] = value;
      for (const agent of this._agents.values()) {
        agent.planStale = true;
      }
    }

    _clearWorldStateKey(uid, key) {
      const agent = this._agents.get(Number(uid));
      if (!agent) {
        return;
      }

      delete agent.worldState[String(key)];
      agent.planStale = true;
    }

    _setAlertLevel(uid, level) {
      const agent = this._agents.get(Number(uid));
      if (!agent) {
        return;
      }

      const nextLevel = this._clamp01(Number(level ?? 0));
      const previousTier = agent.alertTierIndex;
      agent.alertBaseLevel = nextLevel;
      agent.stimuli = [];
      this._syncAlertState(agent);

      if (previousTier !== agent.alertTierIndex) {
        this._lastTriggerAgentUID = agent.uid;
        this._lastAlertTierIndex = agent.alertTierIndex;
        this._lastAlertTierName = ALERT_TIER_NAMES[agent.alertTierIndex];
        this._lastAlertLevel = agent.alertLevel;
        this._lastPreviousTierIndex = previousTier;
        this._trigger("OnAlertStateChanged");
      }
    }

    _addStimulus(uid, type, intensity, x, y, extraJson) {
      const agent = this._agents.get(Number(uid));
      if (!agent) {
        return;
      }

      const stimulusIntensity = this._clamp01(Number(intensity ?? 0));
      const previousTier = agent.alertTierIndex;
      const extra = this._parseExtraJson(extraJson);

      agent.stimuli.push({
        type: String(type ?? ""),
        remaining: stimulusIntensity,
        decayRate: Math.max(0, Number(extra.decayRate ?? this._alertDecayRate)),
        x: Number(x ?? 0),
        y: Number(y ?? 0),
      });

      if (extra.worldStateKey) {
        agent.worldState[String(extra.worldStateKey)] = extra.worldStateValue;
      }

      this._syncAlertState(agent);

      this._lastTriggerAgentUID = agent.uid;
      this._lastStimulusType = String(type ?? "");
      this._lastStimulusX = Number(x ?? 0);
      this._lastStimulusY = Number(y ?? 0);
      this._lastStimulusIntensity = stimulusIntensity;
      this._trigger("OnStimulusReceived");

      if (previousTier !== agent.alertTierIndex) {
        this._lastTriggerAgentUID = agent.uid;
        this._lastAlertTierIndex = agent.alertTierIndex;
        this._lastAlertTierName = ALERT_TIER_NAMES[agent.alertTierIndex];
        this._lastAlertLevel = agent.alertLevel;
        this._lastPreviousTierIndex = previousTier;
        this._trigger("OnAlertStateChanged");
      }

      const bestScore = this._getBestInterruptScore(agent);
      if (agent.activeTask && bestScore >= this._interruptThreshold) {
        const interruptedTask = agent.activeTask;
        const plan = this._decomposeTask(agent, this._taskNetworks.get(agent.agentType)?.root, 0);
        if (plan && plan.length && plan[0] !== interruptedTask) {
          agent.plan = plan.slice();
          agent.activeTask = agent.plan[0] ?? "";
          agent.planStale = false;
          this._lastTriggerAgentUID = agent.uid;
          this._lastInterruptedTask = interruptedTask;
          this._lastNewTask = agent.activeTask;
          this._lastInterruptScore = bestScore;
          this._lastCurrentTask = agent.activeTask;
          this._lastPreviousTask = interruptedTask;
          this._lastPlanLength = agent.plan.length;
          this._lastPlanResult = "interrupted";
          this._trigger("OnPlanInterrupted");
          this._trigger("OnPrimitiveTaskStarted");
        }
      }
    }

    _addStimulusExtended(uid, stimulusJson) {
      const parsed = this._parseExtraJson(stimulusJson);
      this._addStimulus(
        uid,
        parsed.type ?? "",
        parsed.intensity ?? 0,
        parsed.x ?? 0,
        parsed.y ?? 0,
        stimulusJson
      );
    }

    _clearStimuli(uid) {
      const agent = this._agents.get(Number(uid));
      if (agent) {
        agent.stimuli = [];
        this._syncAlertState(agent);
      }
    }

    _decayAlert(uid, amount) {
      const agent = this._agents.get(Number(uid));
      if (!agent) {
        return;
      }

      agent.alertBaseLevel = this._clamp01(agent.alertBaseLevel - Math.max(0, Number(amount ?? 0)));
      this._syncAlertState(agent);
    }

    _setDebugMode(enabled) {
      this._debugMode = !!enabled;
    }

    _setEnabled(enabled) {
      this._enabled = !!enabled;
    }

    _setPlanningMode(mode) {
      const value = String(mode ?? "");
      this._planningMode = value === "interval_sec" ? "interval_sec" : "per_frame";
    }

    _setPlanningIntervalSec(seconds) {
      this._planningIntervalSec = Math.max(0.01, Number(seconds ?? this._planningIntervalSec));
    }

    _setMaxAgentsPerTick(count) {
      this._maxAgentsPerTick = Math.max(0, Math.floor(Number(count ?? this._maxAgentsPerTick)));
    }

    _setPlanningTimeSliceSec(seconds) {
      this._planningTimeSliceSec = Math.max(0, Number(seconds ?? this._planningTimeSliceSec));
    }

    _processPlanningNow() {
      this._processPlanningQueue();
    }

    _dumpAgentState(uid) {
      const agent = this._agents.get(Number(uid));
      if (!agent || !this._debugMode) {
        return;
      }

      console.log(
        "TactiCore agent state",
        JSON.stringify(
          {
            uid: agent.uid,
            agentType: agent.agentType,
            alertLevel: agent.alertLevel,
            alertTierIndex: agent.alertTierIndex,
            worldState: agent.worldState,
            plan: agent.plan,
            activeTask: agent.activeTask,
            previousTask: agent.previousTask,
            scores: this._collectScoringSnapshot(agent),
          },
          null,
          2
        )
      );
    }

    _getActiveTask(uid) {
      return this._agents.get(Number(uid))?.activeTask ?? "";
    }

    _getAlertLevel(uid) {
      return this._agents.get(Number(uid))?.alertLevel ?? 0;
    }

    _getWorldStateValue(uid, key) {
      const agent = this._agents.get(Number(uid));
      if (!agent) {
        return 0;
      }

      return this._getCombinedState(agent)[String(key)] ?? 0;
    }

    _getAlertTierIndex(uid) {
      return this._agents.get(Number(uid))?.alertTierIndex ?? 0;
    }

    _getAlertTierName(uid) {
      return ALERT_TIER_NAMES[this._getAlertTierIndex(uid)] ?? ALERT_TIER_NAMES[0];
    }

    _evaluateScorer(uid, scorerId) {
      const agent = this._agents.get(Number(uid));
      if (!agent) {
        return 0;
      }

      return this._evaluateScorerDefinition(
        this._utilityScorers.get(String(scorerId ?? "")),
        this._getCombinedState(agent)
      );
    }

    _getCountRegisteredNetworks() {
      return this._taskNetworks.size;
    }

    _getCountRegisteredScorers() {
      return this._utilityScorers.size;
    }

    _getCountAgents() {
      return this._agents.size;
    }

    _getAgentUIDByIndex(index) {
      return this._agentOrder[Number(index)] ?? 0;
    }

    _getCountRegisteredTasks(agentType) {
      const network = this._taskNetworks.get(String(agentType ?? ""));
      return network ? this._collectPrimitiveTaskIds(network).length : 0;
    }

    _getRegisteredTaskByIndex(agentType, index) {
      const network = this._taskNetworks.get(String(agentType ?? ""));
      if (!network) {
        return "";
      }

      return this._collectPrimitiveTaskIds(network)[Number(index)] ?? "";
    }

    _beginTaskNetworkBuilder(agentType, rootTaskName) {
      const typeKey = String(agentType ?? "").trim();
      const root = String(rootTaskName ?? "").trim();
      if (!typeKey || !root) {
        return false;
      }

      this._taskNetworkBuilders.set(typeKey, {
        root,
        tasks: {},
      });
      return true;
    }

    _clearTaskNetworkBuilder(agentType) {
      return this._taskNetworkBuilders.delete(String(agentType ?? "").trim());
    }

    _ensureTaskNetworkBuilder(agentType) {
      return this._taskNetworkBuilders.get(String(agentType ?? "").trim()) ?? null;
    }

    _addBuilderCompoundTask(agentType, taskName) {
      const builder = this._ensureTaskNetworkBuilder(agentType);
      const taskKey = String(taskName ?? "").trim();
      if (!builder || !taskKey) {
        return false;
      }

      if (!builder.tasks[taskKey] || builder.tasks[taskKey].type !== "compound") {
        builder.tasks[taskKey] = {
          type: "compound",
          methods: [],
        };
      }
      return true;
    }

    _addBuilderPrimitiveTask(agentType, taskName, primitiveId) {
      const builder = this._ensureTaskNetworkBuilder(agentType);
      const taskKey = String(taskName ?? "").trim();
      const primitive = String(primitiveId ?? "").trim();
      if (!builder || !taskKey || !primitive) {
        return false;
      }

      builder.tasks[taskKey] = {
        type: "primitive",
        id: primitive,
      };
      return true;
    }

    _findOrCreateBuilderMethod(agentType, taskName, methodId) {
      const builder = this._ensureTaskNetworkBuilder(agentType);
      const taskKey = String(taskName ?? "").trim();
      const methodKey = String(methodId ?? "").trim();
      if (!builder || !taskKey || !methodKey) {
        return null;
      }

      if (!builder.tasks[taskKey]) {
        builder.tasks[taskKey] = {
          type: "compound",
          methods: [],
        };
      }

      const task = builder.tasks[taskKey];
      if (task.type !== "compound") {
        return null;
      }

      let method = task.methods.find((entry) => entry.id === methodKey);
      if (!method) {
        method = {
          id: methodKey,
          conditions: [],
          subtasks: [],
        };
        task.methods.push(method);
      }
      return method;
    }

    _addBuilderMethod(agentType, taskName, methodId) {
      return !!this._findOrCreateBuilderMethod(agentType, taskName, methodId);
    }

    _setBuilderMethodScorer(agentType, taskName, methodId, scorerId) {
      const method = this._findOrCreateBuilderMethod(agentType, taskName, methodId);
      const scorer = String(scorerId ?? "").trim();
      if (!method || !scorer) {
        return false;
      }

      method.utilityScorer = scorer;
      return true;
    }

    _addBuilderMethodCondition(agentType, taskName, methodId, key, op, value) {
      const method = this._findOrCreateBuilderMethod(agentType, taskName, methodId);
      const stateKey = String(key ?? "").trim();
      const operation = String(op ?? "eq").trim();
      if (!method || !stateKey) {
        return false;
      }

      const validOps = new Set(["eq", "neq", "gt", "gte", "lt", "lte"]);
      method.conditions.push({
        key: stateKey,
        op: validOps.has(operation) ? operation : "eq",
        value,
      });
      return true;
    }

    _addBuilderMethodSubtask(agentType, taskName, methodId, subtaskTaskName) {
      const method = this._findOrCreateBuilderMethod(agentType, taskName, methodId);
      const subtask = String(subtaskTaskName ?? "").trim();
      if (!method || !subtask) {
        return false;
      }

      method.subtasks.push(subtask);
      return true;
    }

    _registerBuiltTaskNetwork(agentType) {
      const typeKey = String(agentType ?? "").trim();
      const builder = this._taskNetworkBuilders.get(typeKey);
      if (!builder || !builder.root) {
        return false;
      }

      // Builder drafts are normalized into the runtime HTN shape consumed by decomposition.
      const tasks = {};
      for (const [name, task] of Object.entries(builder.tasks)) {
        if (task.type === "primitive") {
          if (!task.id) {
            continue;
          }
          tasks[name] = {
            type: "primitive",
            id: task.id,
          };
          continue;
        }

        const methods = Array.isArray(task.methods)
          ? task.methods
              .map((method) => {
                // Methods with no subtasks are ignored to prevent dead-end branches.
                const subtasks = Array.isArray(method.subtasks)
                  ? method.subtasks.filter((entry) => String(entry ?? "").trim())
                  : [];
                if (!subtasks.length) {
                  return null;
                }

                const result = {
                  subtasks,
                };

                if (Array.isArray(method.conditions) && method.conditions.length) {
                  result.conditions = method.conditions;
                }
                if (method.utilityScorer) {
                  result.utilityScorer = method.utilityScorer;
                }
                return result;
              })
              .filter(Boolean)
          : [];

        tasks[name] = {
          type: "compound",
          methods,
        };
      }

      if (!tasks[builder.root]) {
        return false;
      }

      this._taskNetworks.set(typeKey, {
        root: builder.root,
        tasks,
      });
      this._lastRegisteredAgentType = typeKey;
      this._trigger("OnTaskNetworkRegistered");
      return true;
    }

    _beginUtilityScorerBuilder(scorerId, aggregation = "weighted_sum") {
      const idKey = String(scorerId ?? "").trim();
      if (!idKey) {
        return false;
      }

      const agg = String(aggregation ?? "weighted_sum").trim();
      this._utilityScorerBuilders.set(idKey, {
        id: idKey,
        aggregation: agg === "minimum" ? "minimum" : "weighted_sum",
        inputs: [],
      });
      return true;
    }

    _clearUtilityScorerBuilder(scorerId) {
      return this._utilityScorerBuilders.delete(String(scorerId ?? "").trim());
    }

    _addUtilityScorerInput(
      scorerId,
      worldStateKey,
      weight = 1,
      invert = 0,
      x1 = 0,
      y1 = 0,
      x2 = 1,
      y2 = 1
    ) {
      const builder = this._utilityScorerBuilders.get(String(scorerId ?? "").trim());
      const key = String(worldStateKey ?? "").trim();
      if (!builder || !key) {
        return false;
      }

      builder.inputs.push({
        worldStateKey: key,
        weight: Number(weight ?? 1),
        invert: !!Number(invert ?? 0),
        curve: [
          [Number(x1 ?? 0), Number(y1 ?? 0)],
          [Number(x2 ?? 1), Number(y2 ?? 1)],
        ],
      });
      return true;
    }

    _registerBuiltUtilityScorer(scorerId) {
      const builder = this._utilityScorerBuilders.get(String(scorerId ?? "").trim());
      if (!builder || !builder.id) {
        return false;
      }

      this._utilityScorers.set(builder.id, {
        id: builder.id,
        aggregation: builder.aggregation,
        inputs: builder.inputs.slice(),
      });
      return true;
    }

    _registerTaskNetwork(agentType, networkJson) {
      const parsed = this._parseJson(networkJson);
      if (!parsed) {
        return false;
      }

      this._taskNetworks.set(String(agentType ?? ""), parsed);
      this._lastRegisteredAgentType = String(agentType ?? "");
      this._trigger("OnTaskNetworkRegistered");
      return true;
    }

    _registerUtilityScorer(scorerJson) {
      const parsed = this._parseJson(scorerJson);
      if (!parsed?.id) {
        return false;
      }

      this._utilityScorers.set(String(parsed.id), parsed);
      return true;
    }

    _collectScoringSnapshot(agent) {
      const combined = this._getCombinedState(agent);
      const results = {};
      for (const [scorerId, scorer] of this._utilityScorers.entries()) {
        results[scorerId] = this._evaluateScorerDefinition(scorer, combined);
      }
      return results;
    }

    _getBestInterruptScore(agent) {
      const network = this._taskNetworks.get(agent.agentType);
      if (!network) {
        return 0;
      }

      let bestScore = 0;
      const combined = this._getCombinedState(agent);
      for (const task of Object.values(network.tasks ?? {})) {
        for (const method of task.methods ?? []) {
          if (method.utilityScorer && this._areConditionsMet(method.conditions ?? [], combined)) {
            bestScore = Math.max(
              bestScore,
              this._evaluateScorerDefinition(this._utilityScorers.get(method.utilityScorer), combined)
            );
          }
        }
      }

      return bestScore;
    }

    _updateStimuli(dt) {
      for (const agent of this._agents.values()) {
        if (!agent.stimuli.length) {
          continue;
        }

        for (const stimulus of agent.stimuli) {
          stimulus.remaining = Math.max(0, stimulus.remaining - dt * stimulus.decayRate);
        }

        agent.stimuli = agent.stimuli.filter((stimulus) => stimulus.remaining > 0);
        this._syncAlertState(agent);
      }
    }

    _updateAlertDecay(dt) {
      if (this._alertDecayRate <= 0) {
        return;
      }

      for (const agent of this._agents.values()) {
        if (agent.stimuli.length) {
          continue;
        }

        const previousTier = agent.alertTierIndex;
        agent.alertBaseLevel = this._clamp01(agent.alertBaseLevel - dt * this._alertDecayRate);
        this._syncAlertState(agent);

        if (previousTier !== agent.alertTierIndex) {
          this._lastTriggerAgentUID = agent.uid;
          this._lastAlertTierIndex = agent.alertTierIndex;
          this._lastAlertTierName = ALERT_TIER_NAMES[agent.alertTierIndex];
          this._lastAlertLevel = agent.alertLevel;
          this._lastPreviousTierIndex = previousTier;
          this._trigger("OnAlertStateChanged");
        }
      }
    }

    _syncAlertState(agent) {
      const totalStimulus = agent.stimuli.reduce((sum, stimulus) => sum + stimulus.remaining, 0);
      const nextLevel = this._clamp01(agent.alertBaseLevel + totalStimulus);
      const previousTier = agent.alertTierIndex;

      agent.alertLevel = nextLevel;
      agent.alertTierIndex = this._getAlertTierIndexFromLevel(nextLevel);
      agent.worldState.alertLevel = nextLevel;
      agent.worldState.alertTier = agent.alertTierIndex;
      agent.worldState.alertTierName = ALERT_TIER_NAMES[agent.alertTierIndex];

      if (previousTier !== agent.alertTierIndex) {
        this._lastTriggerAgentUID = agent.uid;
        this._lastAlertTierIndex = agent.alertTierIndex;
        this._lastAlertTierName = ALERT_TIER_NAMES[agent.alertTierIndex];
        this._lastAlertLevel = nextLevel;
        this._lastPreviousTierIndex = previousTier;
      }
    }

    _getAlertTierIndexFromLevel(level) {
      if (level >= this._alertTierThresholds[2]) {
        return 3;
      }
      if (level >= this._alertTierThresholds[1]) {
        return 2;
      }
      if (level >= this._alertTierThresholds[0]) {
        return 1;
      }
      return 0;
    }

    _getCombinedState(agent) {
      return {
        ...this._globalState,
        ...agent.worldState,
        alertLevel: agent.alertLevel,
        alertTier: agent.alertTierIndex,
        alertTierName: ALERT_TIER_NAMES[agent.alertTierIndex],
      };
    }

    _collectPrimitiveTaskIds(network) {
      const ids = [];
      const tasks = network?.tasks ?? {};
      const visit = (taskName) => {
        const task = tasks[taskName];
        if (!task) {
          return;
        }

        if (task.type === "primitive") {
          ids.push(task.id ?? taskName);
          return;
        }

        for (const method of task.methods ?? []) {
          for (const subtask of method.subtasks ?? []) {
            visit(subtask);
          }
        }
      };

      visit(network.root);
      return [...new Set(ids)];
    }

    _decomposeTask(agent, taskName, depth) {
      if (depth > this._maxPlanDepth) {
        // Guards against runaway recursion from malformed/cyclic authored data.
        return null;
      }

      const network = this._taskNetworks.get(agent.agentType);
      const task = network?.tasks?.[taskName];
      if (!task) {
        return null;
      }

      if (task.type === "primitive") {
        return [task.id ?? taskName];
      }

      const combined = this._getCombinedState(agent);
      const validMethods = (task.methods ?? []).filter((method) =>
        this._areConditionsMet(method.conditions ?? [], combined)
      );

      if (!validMethods.length) {
        return null;
      }

      const methods = this._rankMethods(validMethods, combined);
      for (const method of methods) {
        // Branch expansion is depth-first: any invalid child rejects the whole method branch.
        const branch = [];
        let validBranch = true;

        for (const subtask of method.subtasks ?? []) {
          const nextPlan = this._decomposeTask(agent, subtask, depth + 1);
          if (!nextPlan) {
            validBranch = false;
            break;
          }

          branch.push(...nextPlan);
        }

        if (validBranch && branch.length) {
          return branch;
        }
      }

      return null;
    }

    _rankMethods(methods, combinedState) {
      const ranked = methods.map((method, index) => ({
        method,
        index,
        score: method.utilityScorer
          ? this._evaluateScorerDefinition(this._utilityScorers.get(method.utilityScorer), combinedState)
          : -1,
      }));

      if (ranked.some((entry) => entry.score >= 0)) {
        ranked.sort((left, right) => right.score - left.score || left.index - right.index);
        return ranked.map((entry) => entry.method);
      }

      return methods;
    }

    _areConditionsMet(conditions, combinedState) {
      return (conditions ?? []).every((condition) => {
        const left = combinedState[String(condition.key)] ?? 0;
        const right = condition.value;
        switch (condition.op) {
          case "eq":
          case "==":
            return Number(left) === Number(right);
          case "neq":
          case "!=":
            return Number(left) !== Number(right);
          case "gt":
          case ">":
            return Number(left) > Number(right);
          case "gte":
          case ">=":
            return Number(left) >= Number(right);
          case "lt":
          case "<":
            return Number(left) < Number(right);
          case "lte":
          case "<=":
            return Number(left) <= Number(right);
          default:
            return false;
        }
      });
    }

    _evaluateScorerDefinition(scorer, combinedState) {
      if (!scorer) {
        return 0;
      }

      const inputs = Array.isArray(scorer.inputs) ? scorer.inputs : [];
      if (!inputs.length) {
        return 0;
      }

      const values = inputs.map((input) => {
        const rawValue = Number(combinedState[String(input.worldStateKey)] ?? 0);
        const curveValue = this._evaluateCurve(input.curve ?? [], rawValue);
        const finalValue = input.invert ? 1 - curveValue : curveValue;
        // Clamp each weighted input so bad data cannot produce out-of-range totals.
        return Math.max(0, Math.min(1, finalValue * Number(input.weight ?? 1)));
      });

      const aggregation = scorer.aggregation ?? "weighted_sum";
      if (aggregation === "minimum") {
        return this._clamp01(Math.min(...values));
      }

      return this._clamp01(values.reduce((sum, value) => sum + value, 0));
    }

    _evaluateCurve(curve, value) {
      // Piecewise-linear interpolation over sorted points tolerates unordered author input.
      const points = (curve ?? [])
        .map((point) => [Number(point[0]), Number(point[1])])
        .sort((left, right) => left[0] - right[0]);

      if (!points.length) {
        return 0;
      }

      if (value <= points[0][0]) {
        return points[0][1];
      }

      for (let index = 0; index < points.length - 1; index += 1) {
        const [x1, y1] = points[index];
        const [x2, y2] = points[index + 1];
        if (value >= x1 && value <= x2) {
          // Linear interpolation inside the matched segment.
          const ratio = x2 === x1 ? 0 : (value - x1) / (x2 - x1);
          return y1 + (y2 - y1) * ratio;
        }
      }

      return points[points.length - 1][1];
    }

    _parseJson(jsonText) {
      try {
        return JSON.parse(String(jsonText ?? ""));
      } catch (error) {
        if (this._debugMode) {
          console.error("TactiCore parse error", error);
        }
        return null;
      }
    }

    _parseExtraJson(jsonText) {
      const parsed = this._parseJson(jsonText);
      return parsed && typeof parsed === "object" ? parsed : {};
    }

    _clamp01(value) {
      return Math.max(0, Math.min(1, Number(value ?? 0)));
    }

    _nowSec() {
      if (typeof performance !== "undefined" && typeof performance.now === "function") {
        return performance.now() / 1000;
      }

      return Date.now() / 1000;
    }

    _getDebuggerProperties() {
      return [
        {
          title: `$${this.type?.name ?? "TactiCore"} — Summary`,
          properties: [
            { name: "$registeredNetworks", value: this._taskNetworks.size },
            { name: "$registeredScorers", value: this._utilityScorers.size },
            { name: "$activeAgents", value: this._agents.size },
            { name: "$enabled", value: this._enabled },
            { name: "$planningTimeSliceSec", value: this._planningTimeSliceSec },
            { name: "$lastPlanRequestAgentUID", value: this._lastTriggerAgentUID },
            { name: "$lastPlanResult", value: this._lastPlanResult },
            { name: "$lastInterruptScore", value: this._lastInterruptScore },
            { name: "$globalStateKeys", value: Object.keys(this._globalState).join(",") },
          ],
        },
      ];
    }
  };
}
