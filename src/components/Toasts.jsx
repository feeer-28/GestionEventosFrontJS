import { useToast } from '../context/ToastContext'

export default function Toasts() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="fixed bottom-4 right-4 z-[60] space-y-2 w-80 max-w-[95vw]">
      {toasts.map(t => (
        <div key={t.id} className={`rounded-lg shadow px-4 py-3 text-white flex items-start gap-3 ${
          t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-emerald-600' : 'bg-slate-800'
        }`}>
          <div className="text-lg leading-none">
            {t.type === 'error' ? '⛔' : t.type === 'success' ? '✅' : 'ℹ️'}
          </div>
          <div className="flex-1 text-sm">{t.message}</div>
          <button onClick={()=>dismiss(t.id)} className="text-white/80 hover:text-white">✖</button>
        </div>
      ))}
    </div>
  )
}
