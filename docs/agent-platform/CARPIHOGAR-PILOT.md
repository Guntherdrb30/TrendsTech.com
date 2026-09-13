# CarpiHogar Pilot — Trends172 Agent Platform

## Purpose

Prove that a tenant-scoped Trends172 agent can use CarpiHogar's existing MCP without duplicating CarpiHogar business logic.

## Verified MCP surface

The current MCP route registers six commerce tools directly and delegates additional design/project tools to `registerDesignTools`.

Commerce:
- search_products
- get_product
- add_to_cart
- view_cart
- update_cart_quantity
- remove_from_cart

Design / project:
- get_capabilities
- analyze_design_request
- analyze_project_document
- generate_bom
- validate_bom_stock
- create_carpentry_estimate
- generate_cut_list
- add_project_to_cart

This is currently 14 registered tool names in repository code. The earlier 11-tool target is therefore stale and must not be hard-coded as the Control Plane source of truth. Discovery should become dynamic before production use.

## Pilot deployment

Template: `customer-service-commerce`
Tenant: `carpihogar`
Channel: `api` initially
MCP binding: `carpihogar-mcp`

## Isolation requirements

Every run must contain tenantId, deploymentId, agentInstanceId and sessionId. The MCP binding must be resolved from the deployment; clients cannot submit an arbitrary MCP endpoint.

## Initial risk policy

Automatic READ:
- search_products
- get_product
- view_cart
- get_capabilities
- analyze_design_request
- analyze_project_document
- generate_bom
- validate_bom_stock
- create_carpentry_estimate
- generate_cut_list

Policy-controlled WRITE:
- add_to_cart
- update_cart_quantity
- remove_from_cart

Human approval for first pilot:
- add_project_to_cart

The policy can later be relaxed for low-risk customer actions after evaluation and audit evidence.

## Evaluation gates

### Catalog truth
Prompt: `Busco piso click gris.`
Expected: use search_products; return only MCP results; never invent price, stock, SKU or brand.

### Quantity reasoning
Prompt: `Necesito 20 m2 del producto que elegi.`
Expected: preserve real product identity; calculate requested quantity using configured product/unit rules; never silently substitute.

### Stock
Expected: current availability comes from MCP/catalog data. Agent memory or static knowledge cannot override transactional stock.

### Cart
Expected: a write is traceable to tenant, deployment, session and tool run. Reuse cart_id where required.

### Design
Prompt: a kitchen/furniture request with incomplete measurements.
Expected: analyze_design_request first; mark assumptions/missing measurements; do not fabricate production dimensions.

### BOM / estimate
Expected: BOM uses confirmed catalog products. Estimate remains preliminary when measurements or stock are unresolved.

## Success criterion

A request enters Trends172 Agent Platform, resolves the CarpiHogar tenant/deployment, invokes the correct CarpiHogar MCP tool, returns real data and persists a run/trace with tool usage, model, duration and cost metadata.

## Production gate

Do not replace the existing ChatGPT -> CarpiHogar MCP path. The centralized path must pass evaluations and be reviewed before production activation.
