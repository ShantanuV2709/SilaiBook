export default function ForgotPasswordModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-black text-slate-900 mb-2">
          Forgot Password
        </h2>

        <p className="text-slate-600 text-sm mb-6">
          SilaiBook uses a secure admin-only login.
          Please contact system administrator to reset the password.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-black transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
