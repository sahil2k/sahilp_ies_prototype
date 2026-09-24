import { JourneyShell } from "@/components/journey/journey-shell"

export default function Layout({ children }: LayoutProps<"/finance">) {
  return <JourneyShell journeyId="finance">{children}</JourneyShell>
}
