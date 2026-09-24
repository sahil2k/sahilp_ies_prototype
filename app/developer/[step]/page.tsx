import { StepPlaceholder, stepParams } from "@/components/journey/step-placeholder"

export const dynamicParams = false

export function generateStaticParams() {
  return stepParams("developer")
}

export default async function Page({ params }: PageProps<"/developer/[step]">) {
  const { step } = await params
  return <StepPlaceholder journeyId="developer" slug={step} />
}
