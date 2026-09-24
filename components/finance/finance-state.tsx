"use client"

import { createContext, useContext, useState } from "react"
import { draftedEntry } from "@/data/company"

// What the controller has done on the current screen. Each finance screen
// mounts its own provider, so every screen starts from the same complete mock
// state in /data. The one exception is the expert handoff decision, which
// lives in lib/handoff-store.ts because an expert's answer only exists if the
// controller asked for one.

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

type Ctx = {
  state: FinanceState
  update: (patch: (s: FinanceState) => FinanceState) => void
}

const FinanceContext = createContext<Ctx | null>(null)

export function FinanceStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FinanceState>(initialState)
  return (
    <FinanceContext.Provider value={{ state, update: setState }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error("useFinance must be used inside FinanceStateProvider")
  return ctx
}
