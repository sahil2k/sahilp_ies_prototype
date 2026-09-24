import { JourneyShell } from "@/components/journey/journey-shell"

export default function Layout({ children }: LayoutProps<"/developer">) {
  return <JourneyShell journeyId="developer">{children}</JourneyShell>
}
