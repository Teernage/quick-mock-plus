export interface Rule {
  url: string
  method: string
  matchMode: string
  data: string
  enabled: boolean
  remark: string
  status?: number
  delayMs?: number
}