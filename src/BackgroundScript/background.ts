/**
 * 插件启动
 */
chrome.runtime.onStartup.addListener(async () => {})

/**
 * 安装事件
 */
chrome.runtime.onInstalled.addListener(async () => {
  // 设置侧边栏行为：点击插件图标时自动打开侧边栏
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
})
