"use client"

import { useSyncExternalStore } from "react"
import { draftedEntry } from "@/data/company"

// What the controller has done in the finance journey this session. Kept in
// sessionStorage — the same pattern as lib/handoff-store.ts and
// lib/agent-store.ts — so it survives navigation between screens and a
// refresh: approving the drafted entry or closing the tax item stays true
// when you come back, and the close-readiness figures it feeds (via
// derived.ts) update on every screen, not just the one where you acted.

export type FinanceState = {
  promotion: "pending" | "promoted" | "kept"
  demotion: "pending" | "demoted" | "kept"
  entry: {
    status: "draft" | "approved" | "reversed"
    amount: number
    edited: boolean
  }
  resolution: "open" | "closed"
  reversedActivity: string[]
}

const initialState: FinanceState = {
  promotion: "pending",
  demotion: "pending",
  entry: { status: "draft", amount: draftedEntry.lines[0].debit, edited: false },
  resolution: "open",
  reversedActivity: [],
}

const KEY = "finance-state"
const listeners = new Set<() => void>()
let current: FinanceState | null = null

function read(): FinanceState {
  if (current) return current
  try {
    const raw = sessionStorage.getItem(KEY)
    current = raw ? { ...initialState, ...JSON.parse(raw) } : initialState
  } catch {
    current = initialState
  }
  return current!
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function write(next: FinanceState) {
  current = next
  try {
    sessionStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    // Storage unavailable: the change still holds for this page view.
  }
  listeners.forEach((l) => l())
}

export function useFinance() {
  const state = useSyncExternalStore(subscribe, read, () => initialState)
  const update = (patch: (s: FinanceState) => FinanceState) => write(patch(read()))
  return { state, update }
}
