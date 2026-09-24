"use client"

import { useSyncExternalStore } from "react"
import { taxQuestion } from "@/data/company"

// The one decision shared between finance screens: whether the controller
// sent the Arizona tax question to an expert. An expert's answer only exists
// if they did, so Expert handoff, Resolution and the exception queue all read
// it. Kept in sessionStorage so it survives navigation and refresh. With no
// decision yet, screens show the AI's unreviewed draft.

export type HandoffDecision = {
  status: "pending" | "sent" | "declined"
  expertId: string
}

const KEY = "handoff-decision"
const initial: HandoffDecision = { status: "pending", expertId: taxQuestion.expertId }
const listeners = new Set<() => void>()
let current: HandoffDecision | null = null

function read(): HandoffDecision {
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

export function setHandoff(patch: Partial<HandoffDecision>) {
  current = { ...read(), ...patch }
  try {
    sessionStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    // Storage unavailable: the decision still holds for this page view.
  }
  listeners.forEach((l) => l())
}

export function useHandoff() {
  return useSyncExternalStore(subscribe, read, () => initial)
}
