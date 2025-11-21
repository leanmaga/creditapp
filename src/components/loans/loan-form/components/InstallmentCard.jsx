import React from "react";
import { Trash2 } from "lucide-react";

const InstallmentCard = ({
  installment,
  isEditing,
  canDelete,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <span className="font-medium text-gray-800">
          Cuota {installment.installmentNumber}
        </span>
        {isEditing && canDelete && (
          <button
            type="button"
            onClick={() => onRemove(installment.id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Eliminar cuota"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Fecha de Inicio
          </label>
          <input
            type="date"
            value={installment.startDate}
            onChange={(e) =>
              onUpdate(installment.id, "startDate", e.target.value)
            }
            disabled={!isEditing}
            className={`w-full px-3 py-2 text-sm border rounded-md ${
              isEditing
                ? "border-gray-300 focus:ring-2 focus:ring-blue-500"
                : "border-gray-200 bg-gray-100"
            }`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Fecha de Vencimiento
          </label>
          <input
            type="date"
            value={installment.dueDate}
            onChange={(e) =>
              onUpdate(installment.id, "dueDate", e.target.value)
            }
            disabled={!isEditing}
            className={`w-full px-3 py-2 text-sm border rounded-md ${
              isEditing
                ? "border-gray-300 focus:ring-2 focus:ring-blue-500"
                : "border-gray-200 bg-gray-100"
            }`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Monto ($)
          </label>
          <input
            type="number"
            value={installment.amount}
            onChange={(e) =>
              onUpdate(installment.id, "amount", parseInt(e.target.value) || 0)
            }
            disabled={!isEditing}
            className={`w-full px-3 py-2 text-sm border rounded-md ${
              isEditing
                ? "border-gray-300 focus:ring-2 focus:ring-blue-500"
                : "border-gray-200 bg-gray-100"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default InstallmentCard;
