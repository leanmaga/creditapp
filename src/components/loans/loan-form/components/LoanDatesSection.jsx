import React from "react";
import { Calendar, Edit3, X } from "lucide-react";
import InstallmentsList from "./InstallmentsList";

const LoanDatesSection = ({
  formData,
  handleInputChange,
  dateMode,
  setDateMode,
  isEditingDates,
  setIsEditingDates,
  installmentDates,
  updateInstallmentDate,
  removeInstallment,
  addInstallment,
}) => {
  return (
    <div className="border rounded-lg p-6">
      <div className="flex-col pb-4 justify-between items-center mb-4 md:flex lg:flex">
        <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-4 pb-4">
          <Calendar className="text-blue-600" />
          Fechas del Préstamo
        </h2>
        <div className="flex gap-2">
          <select
            value={dateMode}
            onChange={(e) => setDateMode(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="auto">Automático</option>
            <option value="manual">Manual</option>
          </select>
          <button
            type="button"
            onClick={() => setIsEditingDates(!isEditingDates)}
            className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
              isEditingDates
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            {isEditingDates ? <X size={14} /> : <Edit3 size={14} />}
            {isEditingDates ? "Finalizar" : "Editar Cuotas"}
          </button>
        </div>
      </div>

      {/* Fechas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Inicio *
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Vencimiento Final *
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Lista de cuotas */}
      <InstallmentsList
        installments={installmentDates}
        isEditing={isEditingDates}
        onUpdate={updateInstallmentDate}
        onRemove={removeInstallment}
        onAdd={addInstallment}
      />
    </div>
  );
};

export default LoanDatesSection;
