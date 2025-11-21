import React from "react";
import { Plus } from "lucide-react";
import InstallmentCard from "./InstallmentCard";

const InstallmentsList = ({
  installments,
  isEditing,
  onUpdate,
  onRemove,
  onAdd,
}) => {
  if (installments.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Cronograma de Cuotas ({installments.length})
        </h3>
        {isEditing && (
          <button
            type="button"
            onClick={onAdd}
            className="px-3 py-2 bg-green-100 text-green-700 rounded-md text-sm flex items-center gap-1 hover:bg-green-200"
          >
            <Plus size={14} />
            Agregar Cuota
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {installments.map((installment) => (
          <InstallmentCard
            key={installment.id}
            installment={installment}
            isEditing={isEditing}
            canDelete={installments.length > 1}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

export default InstallmentsList;
