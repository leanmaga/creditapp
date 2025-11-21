import React from "react";
import { Save } from "lucide-react";

const FormActions = ({
  onCancel,
  isSubmitting,
  isDisabled,
}) => {
  return (
    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={isSubmitting || isDisabled}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Creando...
          </>
        ) : (
          <>
            <Save size={16} />
            Crear Préstamo
          </>
        )}
      </button>
    </div>
  );
};

export default FormActions;
