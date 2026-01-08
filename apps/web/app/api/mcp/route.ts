import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    mcp: "Trends172 Project Orchestrator",
    status: "online",
    tools: [
      {
        name: "create_project",
        description: "Crear un nuevo proyecto y registrarlo en el sistema"
      },
      {
        name: "update_progress",
        description: "Actualizar fase, avance y tareas del proyecto"
      },
      {
        name: "register_expense",
        description: "Registrar gastos de transporte, hotel, gasoil, etc."
      },
      {
        name: "financial_status",
        description: "Consultar pagos, adelantos y saldo pendiente"
      }
    ],
  });
}
