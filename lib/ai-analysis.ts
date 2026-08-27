export type ComplaintPriority = "baja" | "media" | "alta" | "critica"

export type InformationSufficiency =
  | "insuficiente"
  | "parcial"
  | "suficiente"

export type ComplaintAnalysis = {
  summary: string
  priority: ComplaintPriority
  informationSufficiency: InformationSufficiency
  riskCategories: string[]
  recommendedActions: string[]
  investigationQuestions: string[]
  responsibleAreas: string[]
  timeframe: string
  cautions: string[]
}
