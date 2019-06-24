export interface TemplateManifest {
  Name?: string
  Subject?: string
  HtmlBody?: string
  TextBody?: string
  Alias?: string
  New?: boolean
  TemplateType: string
  LayoutTemplate?: string | null
}

export interface Template extends TemplateManifest {
  Name: string
  TemplateId: number
  AssociatedServerId?: number
  Active: boolean
  Alias: string
}

export interface ListTemplate {
  Active: boolean
  TemplateId: number
  Name: string
  Alias?: string | null
  TemplateType: string
  LayoutTemplate: string | null
}

export interface Templates {
  TotalCount: number
  Templates: ListTemplate[]
}

export interface TemplatePushResults {
  success: number
  failed: number
}

export interface TemplatePushReview {
  layouts: any[]
  templates: any[]
}

export interface ProcessTemplatesOptions {
  spinner: any
  client: any
  outputDir: string
  totalCount: number
  templates: ListTemplate[]
}

export interface TemplateListOptions {
  sourceServer: string
  outputDir: string
}

export interface TemplatePullArguments {
  serverToken: string
  outputdirectory: string
  overwrite: boolean
}

export interface TemplatePushArguments {
  serverToken: string
  templatesdirectory: string
  force: boolean
}

export interface MetaFile {
  Name: string
  Alias: string
  Subject?: string
  LayoutTemplate?: string | null
}
