"use client"

import { createContext, useContext, useState } from "react"
import { draftedEntry, taxQuestion } from "@/data/company"

// What the controller has done on the current screen. Each finance screen
// mounts its own provider, so every screen starts from the same complete mock
// state in /data and never depends on what happened on another screen.

export type FinanceState = {
  promotion: "pending" | "promoted" | "kept"
  demotion: "pending" | "demoted" | "kept"
  entry: {
    status: "draft" | "approved" | "reversed"
    amount: number
    edited: boolean
  }
  handoff: { status: "pending" | "sent" | "declined"; expertId: string }
  resolution: "open" | "closed"
  reversedActivity: string[]
}

const initialState: FinanceState = {
  promotion: "pending",
  demotion: "pending",
  entry: { status: "draft", amount: draftedEntry.lines[0].debit, edited: false },
  handoff: { status: "pending", expertId: taxQuestion.expertId },
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
