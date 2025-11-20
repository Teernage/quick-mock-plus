/// <reference types="chrome"/>

// Chrome 浏览器的扩展 API 中关于浏览数据的命名空间
declare namespace chrome.browsingData {
  // 获取 Onion 访问令牌
  export function getOnionAccessToken(callback: (token: string) => void): void
  // MV3：获取 Onion 访问令牌，返回一个 Promise
  export function getOnionAccessToken(): Promise<string>

  // 获取 Onion 策略
  export function getOnionPolicy(callback: (policy: string) => void): void
  // MV3：获取 Onion 策略，返回一个 Promise
  export function getOnionPolicy(): Promise<string>

  // 获取 Onion 会话信息
  export function getOnionSessionInfo(callback: (session: OnionSessionInfo) => void): void
  // MV3：获取 Onion 会话信息，返回一个 Promise
  export function getOnionSessionInfo(): Promise<OnionSessionInfo>

  //   api=https://onion-api.oraybeta.com
  //   console=https://onion-console.oraybeta.com
  //    drive=https://cds-api.oraybeta.com
  //    signaling=https://onion-signaling.oraybeta.com
  // console-api=https://onion-console-api.oray.com
  // 获取 Onion 服务器 URL
  export function getOnionServerUrl(id: string, callback: (url: string) => void): void
  // MV3：获取 Onion 服务器 URL，返回一个 Promise
  export function getOnionServerUrl(id: string): Promise<string>

  // MV3：获取 Onion 设备信息，返回一个 Promise
  export function getOnionDeviceInfo(): Promise<OnionDeviceInfo>
}

declare namespace chrome.declarativeNetRequest {
  interface SiteConfig {
    url: string
    enable: boolean
    skip_resolve: boolean
    addrs: string[]
  }

  interface AccelerateWebappOptions {
    sites: SiteConfig[]
  }

  function accelerateWebapp(options: AccelerateWebappOptions): Promise<boolean>
}

// Chrome 浏览器的扩展 API 中关于浏览数据的事件
declare namespace chrome.browsingData {
  // Onion 登录数据刷新事件
  export interface OnionEvent {
    addListener(callback: Function): void
  }

  // 当 Onion 登录数据被刷新时触发
  export const onOnionLoginDataRefreshed: OnionEvent
  //

  // 当 Onion 用户登出时触发
  export const onOnionLogout: OnionEvent
  // 当云策略发生变化时触发
  export const onCloudPolicyChanged: OnionEvent
  // 当需要远程 PIN 认证时触发
  export const onRemotePinAuth: OnionEvent

  export const onTeamAvatarChanged: OnionEvent
}

// Chrome 浏览器的扩展 API 中关于图标的命名空间
declare namespace chrome.favicon {
  // 获取指定 URL 的图标
  export function getFavicon(url: string, callback: (faviconUrl: any) => void): void
}

declare namespace chrome.identity {
  export function switchTeam(teamId: string, callback?: (result: { success }) => boolean): { success }
  export function isSignin(callback?: (status: number) => void): boolean
  export function showSigninPrompt(callback?: (status: number) => void): void
  export const onUserDataChanage: OnionEvent
  export const onTeamListChanged: OnionEvent
  export const onSignInChanged: OnionEvent
  export function getTeamList(callback?: (teamArr: []) => void): []
  export function getOnionToken(callback?: (token: string) => void)
}
