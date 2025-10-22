import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let idSeq = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'info', timeout = 3000) => {
    const id = idSeq++
    setToasts(prev => [...prev, { id, message, type }])
    if (timeout) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, timeout)
    }
    return id
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const value = useMemo(() => ({ toasts, show, dismiss }), [toasts, show, dismiss])

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  )
}

export function useToast() { return useContext(ToastContext) }
