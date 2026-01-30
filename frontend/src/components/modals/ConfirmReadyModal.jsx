export default function ConfirmReadyModal({ order, onClose, onConfirm }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">

        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">
          Confirm Order Completion
        </h2>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          This will permanently deduct cloth from stock.
          <br />
          <strong>This action cannot be undone.</strong>
        </p>

        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm mb-4 border border-gray-100 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          <p><strong>Order:</strong> {order.order_number}</p>
          <p><strong>Customer:</strong> {order.customer_name}</p>
          <p><strong>Type:</strong> {order.order_type}</p>
        </div>

        <p className="text-sm mb-6 text-slate-600 dark:text-slate-400">
          Are you sure stitching is fully completed and ready for delivery?
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition"
          >
            Yes, Mark Ready
          </button>
        </div>

      </div>
    </div>
  );
}
