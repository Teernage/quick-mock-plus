interface OnionMessage {
  type: string
  payload?: any
}

interface OnionResponse {
  code: number
  message: string
  data?: any
}

interface AppInfo {
  name: string
  url: string
  report_rule: AppReportRule
}

interface OnionPolicy {
  app: AppInfo[]
}

interface OnionSessionInfo {
  device_id: string
  device_name: string
  current_team_id: string
  user_id: string
  user_name: string
  email: string
  mobile: string
  nick_name: string
  current_team_id: string
}

interface OnionDeviceInfo {
  device_id: string
  device_name: string
  ip: string
  mac: string
}

interface AppReportFeature {
  summary?: number | boolean
  click?: number | boolean
  xhr?: number | boolean
}

interface AppReportRule {
  name?: string
  feature: AppReportFeature
}

type WatermarkContent = {
  date: number
  device_name: number
  email: number
  mobile: number
  ip: number
  mac: number
  name: number
}

type WatermarkStyle = {
  font_size: number
  opacity: number
  rotate: number
}

type WatermarkConf = {
  content_conf: WatermarkContent
} & WatermarkStyle

type WatermarkRule = {
  domain: string
} & WatermarkConf

type SiteACLConf = {
  domain: string
  /**
   * watermark 启用水印功能后才有
   */
  watermark?: WatermarkConf
}

interface ACLConf {
  sites: SiteACLConf[]
}

declare module '*?script' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

interface Number {
  padTime(): string
}

declare namespace chrome.webRequest {
  export interface WebRequestBodyDetails {
    documentId: string
  }
}
