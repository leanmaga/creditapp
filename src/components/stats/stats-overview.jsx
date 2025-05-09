"use client";

import { useState, useEffect } from "react";
import {
  CircleDollarSign,
  TrendingUp,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchStatsData } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

export function StatsOverview() {
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await fetchStatsData();
        setStatsData(data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-2/3 mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 mt-2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock data for demonstration - replace with actual data from API
  const mockStats = statsData || {
    totalClients: 12,
    activeLoans: 8,
    totalLent: 1200000,
    totalCollected: 800000,
    totalInterest: 400000,
    overdueInstallments: 3,
    monthlyData: [
      { month: "Ene", prestado: 150000, cobrado: 120000, interes: 50000 },
      { month: "Feb", prestado: 180000, cobrado: 140000, interes: 60000 },
      { month: "Mar", prestado: 200000, cobrado: 160000, interes: 70000 },
      { month: "Abr", prestado: 220000, cobrado: 170000, interes: 75000 },
      { month: "May", prestado: 190000, cobrado: 150000, interes: 65000 },
      { month: "Jun", prestado: 210000, cobrado: 180000, interes: 72000 },
    ],
    loanStatusDistribution: [
      { name: "Activos", value: 8 },
      { name: "Completados", value: 15 },
    ],
    installmentStatusDistribution: [
      { name: "Pagadas", value: 42 },
      { name: "Pendientes", value: 20 },
      { name: "Vencidas", value: 3 },
    ],
  };

  // Colors for pie charts
  const LOAN_STATUS_COLORS = ["#3b82f6", "#22c55e"];
  const INSTALLMENT_STATUS_COLORS = ["#22c55e", "#3b82f6", "#ef4444"];

  const formatTooltipValue = (value) => {
    return formatCurrency(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-3 shadow-md">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {label}
          </p>
          {payload.map((entry, index) => (
            <p
              key={`item-${index}`}
              style={{ color: entry.color }}
              className="text-sm"
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-3 shadow-md">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Capital Prestado
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(mockStats.totalLent)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total de dinero otorgado en préstamos
            </p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Capital Recuperado
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(mockStats.totalCollected)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total de dinero recaudado
            </p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Intereses Generados
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-500 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(mockStats.totalInterest)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ganancias por intereses
            </p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {mockStats.totalClients}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Clientes registrados en el sistema
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
        <CardHeader>
          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                  Análisis Financiero
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
                  Análisis detallado de la actividad financiera
                </CardDescription>
              </div>
              <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm rounded-md"
                >
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="loans"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm rounded-md"
                >
                  Préstamos
                </TabsTrigger>
                <TabsTrigger
                  value="installments"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm rounded-md"
                >
                  Cuotas
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="pt-4">
              <ResponsiveContainer width="100%" height={380}>
                <BarChart
                  data={mockStats.monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis tickFormatter={formatTooltipValue} stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                  <Bar
                    dataKey="prestado"
                    name="Prestado"
                    fill="#3b82f6"
                    barSize={30}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="cobrado"
                    name="Cobrado"
                    fill="#22c55e"
                    barSize={30}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="interes"
                    name="Interés"
                    fill="#a855f7"
                    barSize={30}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="loans" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Estado de Préstamos
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockStats.loanStatusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockStats.loanStatusDistribution.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                LOAN_STATUS_COLORS[
                                  index % LOAN_STATUS_COLORS.length
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip content={<PieCustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        Activos
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Completados
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Estadísticas Adicionales
                  </h3>
                  <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Préstamos Activos
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {mockStats.activeLoans}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${
                                  (mockStats.activeLoans /
                                    mockStats.totalClients) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Préstamos por Cliente
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {(
                                (mockStats.activeLoans +
                                  mockStats.loanStatusDistribution[1].value) /
                                mockStats.totalClients
                              ).toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Tasa de Recuperación
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {(
                                (mockStats.totalCollected /
                                  mockStats.totalLent) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${
                                  (mockStats.totalCollected /
                                    mockStats.totalLent) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Margen de Interés
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {(
                                (mockStats.totalInterest /
                                  mockStats.totalLent) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{
                                width: `${
                                  (mockStats.totalInterest /
                                    mockStats.totalLent) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="installments" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Estado de Cuotas
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockStats.installmentStatusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockStats.installmentStatusDistribution.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                INSTALLMENT_STATUS_COLORS[
                                  index % INSTALLMENT_STATUS_COLORS.length
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip content={<PieCustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Pagadas
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Pendientes
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Vencidas
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Cuotas en Riesgo
                  </h3>
                  <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 mb-4">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                Cuotas Vencidas
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Cuotas no pagadas pasada la fecha límite
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full ml-auto">
                            {mockStats.overdueInstallments}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                              width: `${
                                (mockStats.overdueInstallments /
                                  mockStats.installmentStatusDistribution.reduce(
                                    (acc, cur) => acc + cur.value,
                                    0
                                  )) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>Tasa de Morosidad</span>
                          <span>
                            {(
                              (mockStats.overdueInstallments /
                                mockStats.installmentStatusDistribution.reduce(
                                  (acc, cur) => acc + cur.value,
                                  0
                                )) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-4">
                    <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-gray-900 dark:text-gray-100">
                          Comparación de Ingresos Esperados vs Reales
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Ingresos Esperados
                              </span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formatCurrency(
                                  mockStats.totalLent + mockStats.totalInterest
                                )}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Ingresos Reales
                              </span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formatCurrency(mockStats.totalCollected)}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${
                                    (mockStats.totalCollected /
                                      (mockStats.totalLent +
                                        mockStats.totalInterest)) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}
