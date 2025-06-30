import toast from 'react-hot-toast';

export function showConfirmationToast(onConfirm: () => void, onCancel?: () => void) {
  toast.custom((t) => (
    <div
      className={`bg-white rounded shadow-lg p-4 flex flex-col gap-2 w-[300px] ${
        t.visible ? 'animate-enter' : 'animate-leave'
      }`}
    >
      <div className="text-sm font-semibold text-gray-800">Confirmer l'action ?</div>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            toast.dismiss(t.id);
            if (onCancel) onCancel();
          }}
          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          Annuler
        </button>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Confirmer
        </button>
      </div>
    </div>
  ));
}
