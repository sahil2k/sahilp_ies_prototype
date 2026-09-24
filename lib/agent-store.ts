"use client"

import { useSyncExternalStore } from "react"
import type { ActionType } from "@/data/company"
import { agentListingDefaults } from "@/data/developer"

// Flowcast's editable listing and declared actions — the one other piece of
// state shared between developer screens, alongside lib/handoff-store.ts on
// the finance side. Agent Studio writes here; Marketplace listing reads it,
// so an edit made in one shows up in the other. Everything else (agent name,
// the sandbox test, revenue history) is not part of this store and stays
// fixed, since those are referenced as stable facts elsewhere.

export type AgentConfigAction = { id: string; type: ActionType; text: string }

export type AgentConfig = {
  tagline: string
  category: string
  description: string
  pricePerMonth: number
  actions: AgentConfigAction[]
}

const KEY = "agent-config"
const initial: AgentConfig = { ...agentListingDefaults }
const listeners = new Set<() => void>()
let current: AgentConfig | null = null

function read(): AgentConfig {
  if (current) return current
  try {
    const raw = sessionStorage.getItem(KEY)
    current = raw ? { ...initial, ...JSON.parse(raw) } : initial
  } catch {
    current = initial
  }
  return current!
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setAgentConfig(config: AgentConfig) {
  current = config
  try {
    sessionStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    // Storage unavailable: the edit still holds for this page view.
  }
  listeners.forEach((l) => l())
}

export function useAgentConfig() {
  return useSyncExternalStore(subscribe, read, () => initial)
}
