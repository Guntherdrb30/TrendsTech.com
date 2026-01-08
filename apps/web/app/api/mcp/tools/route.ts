export const dynamic = "force-dynamic";

export async function GET() {

  const body = JSON.stringify({
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
        description: "Registrar gastos",
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
        description: "Consultar pagos y saldo pendiente",
        input_schema: {
          type: "object",
          properties: {
            project: { type: "string" }
          },
          required: ["project"]
        }
      }
    ]
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "Content-Length": String(Buffer.byteLength(body)),
      "Content-Encoding": "identity",
      "X-MCP-Endpoint": "tools"
    }
  });
}
