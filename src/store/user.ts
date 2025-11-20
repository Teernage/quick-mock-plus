import { defineStore } from 'pinia'

interface State {
  userData: any // 用户数据
}

export const useUserDataStore = defineStore('userData', {
  // 定义Store的初始状态
  state: (): State => ({
    userData: null
  }),

  // 定义getters，用于从state中派生出一些状态
  getters: {
    getUserData: (state) => state.userData as any // 用户数据
  },

  // 定义actions，用于修改state的逻辑
  actions: {
    /**
     * 设置用户数据
     *
     * @param value 用户数据对象
     */
    setUserData(value) {
      this.userData = value
    }
  },

  // 定义状态持久化的配置
  persist: {
    // 配置需要持久化的状态变量
    paths: ['userData']
  }
})
