export const clickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function (event) {
      // 检查点击事件是否发生在元素或其子元素之外
      if (!(el === event.target || el.contains(event.target))) {
        // 调用传入的方法
        binding.value(event)
      }
    }
    // 添加点击事件监听器到 document
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    // 移除事件监听器
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
