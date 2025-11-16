// src/components/Modal.jsx
function Modal({ children, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative shadow-lg">
        <button
          className="absolute top-2 right-3 text-2xl text-instagram-textSecondary hover:text-instagram-text transition-all"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
