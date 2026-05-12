import { configureStore, createSlice } from '@reduxjs/toolkit'

const savedTheme = localStorage.getItem('theme') || 'dark'
const savedSound = localStorage.getItem('sound') !== 'off'
const savedToken = localStorage.getItem('token') || ''

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: savedTheme },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', state.mode)
      document.documentElement.classList.toggle('dark', state.mode === 'dark')
    },
    setTheme(state, action) {
      state.mode = action.payload
      localStorage.setItem('theme', state.mode)
      document.documentElement.classList.toggle('dark', state.mode === 'dark')
    }
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: savedToken, user: null, achievements: [], soundEnabled: savedSound },
  reducers: {
    setAuth(state, action) {
      const { token, user, achievements } = action.payload
      if (token !== undefined) {
        state.token = token || ''
        if (token) localStorage.setItem('token', token)
        else localStorage.removeItem('token')
      }
      if (user !== undefined) state.user = user
      if (achievements !== undefined) state.achievements = achievements
    },
    logout(state) {
      state.token = ''
      state.user = null
      state.achievements = []
      localStorage.removeItem('token')
    },
    setAchievements(state, action) {
      state.achievements = action.payload || []
    },
    toggleSound(state) {
      state.soundEnabled = !state.soundEnabled
      localStorage.setItem('sound', state.soundEnabled ? 'on' : 'off')
    }
  }
})

const toastSlice = createSlice({
  name: 'toasts',
  initialState: [],
  reducers: {
    pushToast(state, action) {
      state.push({ id: crypto.randomUUID(), ...action.payload })
    },
    removeToast(state, action) {
      return state.filter(t => t.id !== action.payload)
    }
  }
})

export const { toggleTheme, setTheme } = themeSlice.actions
export const { setAuth, logout, setAchievements, toggleSound } = authSlice.actions
export const { pushToast, removeToast } = toastSlice.actions

export const store = configureStore({
  reducer: {
    theme: themeSlice.reducer,
    auth: authSlice.reducer,
    toasts: toastSlice.reducer
  }
})

if (savedTheme === 'dark') document.documentElement.classList.add('dark')
