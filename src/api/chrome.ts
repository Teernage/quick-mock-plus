/**
 * 判断用户是否已登录
 *
 * @returns 返回一个布尔值，表示用户是否已登录
 */
export async function isLoginBrowser(): Promise<boolean> {
  const flag: boolean = await chrome.identity.isSignin()
  return flag
}

/**
 * 从浏览器中获取token
 * */
export async function getTokenFromBrowser() {
  return chrome.browsingData.getOnionAccessToken()
}
