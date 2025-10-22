export default function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-[95vw] sm:w-full max-w-lg sm:max-w-2xl rounded-xl shadow-lg mx-2 sm:mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3 sticky top-0 bg-white z-10 rounded-t-xl">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="p-4 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
