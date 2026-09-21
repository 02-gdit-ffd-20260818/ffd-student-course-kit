import { defineStore } from 'pinia'
import { loginRequest } from '../services/authApi.js'
import { clearAuthSession, readAuthSession, saveAuthSession } from '../services/authSession.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({ session: readAuthSession(), status: 'idle', errorMessage: '' }),
  getters: {
    loggedIn: (state) => Boolean(state.session?.token),
    user: (state) => state.session?.user || null,
  },
  actions: {
    async login(credentials, request = loginRequest) {
      this.status = 'loading'
      this.errorMessage = ''
      try {
        this.session = await request(credentials)
        saveAuthSession(this.session)
        this.status = 'success'
        return true
      } catch (error) {
        this.status = 'error'
        this.errorMessage = error.message
        return false
      }
    },
    logout() {
      clearAuthSession()
      this.session = null
      this.status = 'idle'
    },
  },
})
