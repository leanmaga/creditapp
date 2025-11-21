import React from "react";
import { DollarSign } from "lucide-react";

const LoanBasicInfo = ({
  formData,
  handleInputChange,
  handleCantidadChange,
  handleTipoTiempoChange,
}) => {
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
        <DollarSign className="text-blue-600" />
        Datos del Préstamo
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto a Prestar *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Ej: 100000"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad de Cuotas *
          </label>
          <input
            type="number"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleCantidadChange}
            placeholder="Ej: 12"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tasa de Interés (%) *
          </label>
          <input
            type="number"
            name="interestRate"
            value={formData.interestRate}
            onChange={handleInputChange}
            placeholder="Ej: 50"
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Tiempo
        </label>
        <select
          name="tipoTiempo"
          value={formData.tipoTiempo}
          onChange={handleTipoTiempoChange}
          className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="meses">Meses</option>
          <option value="semanas">Semanas</option>
          <option value="dias">Días</option>
        </select>
      </div>
    </div>
  );
};

export default LoanBasicInfo;
