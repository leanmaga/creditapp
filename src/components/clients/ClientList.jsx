"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  UserPlus,
  CircleDollarSign,
  ChevronRight,
  Calendar,
  Phone,
  Mail,
  Filter,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchClients } from "@/lib/api-client";
import { cn, formatDate } from "@/lib/utils";

export function ClientList() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getClients = async () => {
      try {
        const data = await fetchClients();
        setClients(data);
        setFilteredClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getClients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Users className="h-7 w-7 mr-2 text-blue-600 dark:text-blue-500" />
            Clientes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isLoading
              ? "Cargando clientes..."
              : `${clients.length} clientes registrados`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Buscar cliente..."
              className="pl-8 w-full sm:w-[250px] h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/clientes/nuevo">
            <Button
              className={cn(
                "flex-1 bg-gradient-to-r from-black to-black-600/20 text-white",
                "hover:from-blue-500/30 hover:to-blue-600/30  ",
                "border border-white-500/30 shadow-lg hover:shadow-green-500/20",
                "transition-all duration-300 py-3 sm:py-4 text-sm sm:text-base",
                "flex items-center justify-center gap-2"
              )}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="animate-pulse border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Link href={`/clientes/${client.id}`} key={client.id}>
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 group">
                <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {client.name}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:translate-x-1" />
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {client.phone && (
                      <span className="flex items-center text-gray-600 dark:text-gray-400">
                        <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-500" />
                        {client.phone}
                      </span>
                    )}
                    {client.email && (
                      <span className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                        <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-500" />
                        {client.email}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <CircleDollarSign className="h-4 w-4 mr-1.5 text-green-500 dark:text-green-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {client.loans_count === 0 ? (
                          "Sin préstamos"
                        ) : (
                          <>
                            {client.loans_count} préstamo
                            {client.loans_count !== 1 ? "s" : ""}
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1.5 text-blue-500 dark:text-blue-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {formatDate(client.created_at)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                {client.loans_count > 0 && (
                  <CardFooter className="pt-0 pb-4">
                    <Badge
                      variant="outline"
                      className="mt-2 border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/20"
                    >
                      {client.active_loans_count || 0} préstamos activos
                    </Badge>
                  </CardFooter>
                )}
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="rounded-full w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            No se encontraron clientes
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mt-2">
            {searchTerm
              ? "Prueba con otra búsqueda o crea un nuevo cliente"
              : "Comienza creando tu primer cliente para gestionar sus préstamos"}
          </p>
          <Link href="/clientes/nuevo" className="mt-6 inline-block">
            <Button
              className={cn(
                "flex-1 bg-gradient-to-r from-black to-black-600/20 text-white",
                "hover:from-blue-500/30 hover:to-blue-600/30  ",
                "border border-white-500/30 shadow-lg hover:shadow-green-500/20",
                "transition-all duration-300 py-3 sm:py-4 text-sm sm:text-base",
                "flex items-center justify-center gap-2"
              )}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
