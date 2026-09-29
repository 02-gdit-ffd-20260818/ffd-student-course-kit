// 登录状态的 store。它是全站唯一知道"当前谁登录了"的地方，
// 页面和组件都从这里读，不各自保存一份，免得有的地方已经退出了有的还显示着。
//
// 这里用的是**选项式**写法（state / getters / actions 三段），
// 项目 5 的 queue store 用的是组合式写法。两种都常见，功能一样。

import { defineStore } from 'pinia'
import { loginRequest, registerRequest } from '../services/authApi.js'
import { clearAuthSession, readAuthSession, saveAuthSession } from '../services/authSession.js'

export const useAuthStore = defineStore('auth', {
  // state 必须写成函数。初值里直接读了一次本地保存的会话——
  // 所以刷新页面之后仍然是登录状态，不用重新登录。
  // status 有 idle / loading / success / error 四种，界面据此显示转圈或报错。
  state: () => ({ session: readAuthSession(), status: 'idle', errorMessage: '' }),
  // getters 是"算出来的值"，相当于组件里的 computed
  getters: {
    loggedIn: (state) => Boolean(state.session?.token),
    user: (state) => state.session?.user || null,
  },
  actions: {
    // 第二个参数默认是真正的登录请求。**留这个口子有两个用处**：
    //   1. 测试时传一个假的 request 进来，不用起后端
    //   2. 下面的 register 直接复用这套流程，只换一个请求函数
    async login(credentials, request = loginRequest) {
      this.status = 'loading'
      this.errorMessage = ''
      try {
        // 请求成功：存进 store（界面立刻变），同时写进本地存储（刷新后还在）
        this.session = await request(credentials)
        saveAuthSession(this.session)
        this.status = 'success'
        return true
      } catch (error) {
        // 失败不往外抛，而是把错误信息存进 state 让界面显示，
        // 并返回 false 告诉调用方这次没成功。调用的组件因此不用写 try/catch。
        this.status = 'error'
        this.errorMessage = error.message
        return false
      }
    },
    register(credentials) { return this.login(credentials, registerRequest) },
    // 退出要三处一起清：本地存储、store 里的会话、状态。漏掉任何一处
    // 都会出现"看起来退出了但刷新又回来了"这类奇怪现象。
    logout() {
      clearAuthSession()
      this.session = null
      this.status = 'idle'
    },
  },
})
