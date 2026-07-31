import type { ComponentType } from 'npm:react@18.3.1'
import { template as welcome } from './welcome.tsx'
import { template as priceAlertHit } from './price-alert-hit.tsx'
import { template as weeklyReport } from './weekly-report.tsx'
import { template as predictionResolved } from './prediction-resolved.tsx'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: any) => string)
  displayName?: string
  previewData?: Record<string, unknown>
  to?: string | ((data: any) => string)
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  welcome,
  'price-alert-hit': priceAlertHit,
  'weekly-report': weeklyReport,
  'prediction-resolved': predictionResolved,
}