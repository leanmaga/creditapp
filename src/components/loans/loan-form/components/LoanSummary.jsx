import React from "react";

const LoanSummary = ({
  calculatedData,
  getTotalAmount,
  getTipoTiempoLabel,
}) => {
  if (!calculatedData) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-green-800 mb-4">
        Resumen del Préstamo
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Monto Prestado</p>
          <p className="text-2xl font-bold text-gray-800">
            ${calculatedData.amount.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">
            Interés ({calculatedData.interestRate}%)
          </p>
          <p className="text-2xl font-bold text-blue-600">
            ${calculatedData.interestAmount.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total a Devolver</p>
          <p className="text-2xl font-bold text-green-600">
            ${getTotalAmount().toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Cuota Promedio</p>
          <p className="text-2xl font-bold text-purple-600">
            ${Math.round(calculatedData.monthlyPayment).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white rounded border">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Período:</span>
          <span className="font-medium text-gray-800">
            {calculatedData.startDate} a {calculatedData.endDate}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">Plazo:</span>
          <span className="font-medium text-gray-800">
            {calculatedData.months} {getTipoTiempoLabel()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoanSummary;
