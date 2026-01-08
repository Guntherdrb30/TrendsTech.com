import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      tools: [

        {
          name: "create_project",
          description: "Crear un nuevo proyecto y registrarlo en el sistema",
          input_schema: {
            type: "object",
            properties: {
              project_name: { type: "string" },
              category: { type: "string" }
            },
            required: ["project_name"]
          }
        },

        {
          name: "update_progress",
          description: "Actualizar fase, avance y tareas del proyecto",
          input_schema: {
            type: "object",
            properties: {
              project: { type: "string" },
              phase: { type: "string" },
              progress: { type: "number" }
            },
            required: ["project"]
          }
        },

        {
          name: "register_expense",
          description: "Registrar gastos de transporte, hotel, gasoil, etc.",
          input_schema: {
            type: "object",
            properties: {
              project: { type: "string" },
              amount: { type: "number" },
              type: { type: "string" },
              note: { type: "string" }
            },
            required: ["project", "amount"]
          }
        },

        {
          name: "financial_status",
          description: "Consultar pagos, adelantos y saldo pendiente",
          input_schema: {
            type: "object",
            properties: {
              project: { type: "string" }
            },
            required: ["project"]
          }
        }

      ]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "x-mcp-version": "1.0",
        "Cache-Control": "no-store"
      }
    }
  );
}
