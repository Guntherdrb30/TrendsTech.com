-- Seed de 18 skills para Agent Creator
-- Ejecutar en Neon SQL Editor

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_cocina',
  'cocina',
  'Cocina',
  'Kitchen',
  'hogar',
  'Home & Construction',
  '🍳',
  'Asesoría experta en diseño y configuración de cocinas: materiales, colores, presupuesto.',
  'Expert advisory for kitchen design and configuration: materials, colors, budget.',
  '{"system":"Eres un asesor experto en diseño de cocinas.","instructions":["Pregunta dimensiones","Ofrece opciones de precio","Explica materiales","Prioriza según presupuesto"]}'::jsonb,
  '{"secciones":["muebles_superiores","muebles_inferiores","perfil_gola","meson_superficie","fregadero_griferia","accesorios_internos","iluminacion","piso","revestimiento_paredes","isla","electrodomesticos","electrico","tornilleria","decoracion"]}'::jsonb,
  '[{"id":"dimensiones","question":"¿Dimensiones del espacio?","type":"text"},{"id":"presupuesto","question":"¿Presupuesto estimado?","type":"text"},{"id":"estilo","question":"¿Estilo preferido?","type":"select","options":["moderno","clasico","rustico","minimalista"]}]'::jsonb,
  15,
  true,
  true,
  1,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_bano',
  'bano',
  'Baño',
  'Bathroom',
  'hogar',
  'Home & Construction',
  '🚿',
  'Diseño y asesoría en remodelación de baños: griferías, revestimientos, sanitarios.',
  'Bathroom remodeling advisory: fixtures, tiles, sanitary ware.',
  '{"system":"Eres un asesor experto en diseño de baños.","instructions":["Pregunta si es remodelación total o parcial","Consulta presupuesto","Explica materiales","Sugiere tendencias"]}'::jsonb,
  '{"secciones":["sanitarios","griferia","revestimiento_piso","revestimiento_paredes","mueble_vanidad","espejo","accesorios","iluminacion","ventilacion"]}'::jsonb,
  '[{"id":"tipo","question":"¿Tipo de baño?","type":"select","options":["principal","secundario","servicio"]},{"id":"presupuesto","question":"¿Presupuesto?","type":"text"}]'::jsonb,
  15,
  true,
  false,
  2,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_closet',
  'closet',
  'Clóset',
  'Closet',
  'hogar',
  'Home & Construction',
  '👔',
  'Asesoría en diseño de clósets y vestidores a medida.',
  'Custom closet and dressing room design.',
  '{"system":"Eres un asesor experto en clósets a medida.","instructions":["Pregunta dimensiones y apertura","Consulta qué se guarda","Propón distribución","Sugiere materiales"]}'::jsonb,
  '{"secciones":["colgadores","cajones","estantes","zapatera","accesorios_internos","puertas","iluminacion","espejo"]}'::jsonb,
  '[{"id":"dimensiones","question":"¿Dimensiones?","type":"text"},{"id":"tipo_apertura","question":"¿Tipo de apertura?","type":"select","options":["corredizas","abatibles","sin_puertas","walk_in"]}]'::jsonb,
  15,
  true,
  false,
  3,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_sala_tv',
  'sala_tv',
  'Sala / Mueble TV',
  'Living Room / TV Cabinet',
  'hogar',
  'Home & Construction',
  '🛋️',
  'Diseño de salas de estar y muebles para TV.',
  'Living room and TV cabinet design.',
  '{"system":"Eres asesor de salas y muebles TV.","instructions":["Pregunta tamaño TV","Consulta almacenamiento","Sugiere materiales","Considera flujo de personas"]}'::jsonb,
  '{"secciones":["mueble_tv","sofa","mesa_centro","estanteria","iluminacion","decoracion","alfombra"]}'::jsonb,
  '[{"id":"dimension_tv","question":"¿Tamaño TV (pulgadas)?","type":"text"},{"id":"estilo","question":"¿Estilo?","type":"select","options":["moderno","clasico","minimalista","industrial"]}]'::jsonb,
  15,
  true,
  false,
  4,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_dormitorio',
  'dormitorio',
  'Dormitorio',
  'Bedroom',
  'hogar',
  'Home & Construction',
  '🛏️',
  'Diseño completo de dormitorios: camas, mesas de noche, cómodas.',
  'Complete bedroom design.',
  '{"system":"Eres asesor experto en dormitorios.","instructions":["Pregunta tipo de dormitorio","Consulta dimensiones","Sugiere distribución","Recomienda paleta de colores"]}'::jsonb,
  '{"secciones":["cama","cabecero","mesitas_noche","comoda","espejo","iluminacion","cortinas","alfombra","closet"]}'::jsonb,
  '[{"id":"tipo","question":"¿Tipo?","type":"select","options":["principal","infantil","huespedes"]},{"id":"cama","question":"¿Tamaño de cama?","type":"select","options":["sencilla","doble","queen","king"]}]'::jsonb,
  15,
  true,
  false,
  5,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_odontologia',
  'odontologia',
  'Odontología',
  'Dentistry',
  'salud',
  'Health',
  '🦷',
  'Recepcionista virtual para consultorios dentales: citas, tratamientos, FAQ.',
  'Virtual receptionist for dental offices.',
  '{"system":"Eres asistente virtual de un consultorio odontológico.","instructions":["No des diagnósticos médicos","Ofrece citas ante síntomas","Informa tratamientos","Recuerda llevar seguro"]}'::jsonb,
  '{"servicios":["limpieza","blanqueamiento","ortodoncia","implantes","extracciones","endodoncia","protesis","cirugia_oral"]}'::jsonb,
  '[{"id":"motivo","question":"¿Motivo de consulta?","type":"text"},{"id":"primera_vez","question":"¿Primera visita?","type":"boolean"}]'::jsonb,
  15,
  true,
  true,
  1,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_medicina_general',
  'medicina_general',
  'Medicina General',
  'General Medicine',
  'salud',
  'Health',
  '🩺',
  'Asistente para consultorios médicos: citas e información.',
  'Assistant for medical offices.',
  '{"system":"Eres asistente virtual de medicina general.","instructions":["No diagnostiques","Recomienda consulta presencial","Informa horarios","Explica preparativos para exámenes"]}'::jsonb,
  '{"servicios":["consulta_general","examenes_laboratorio","vacunacion","medicina_preventiva","certificados_medicos"]}'::jsonb,
  '[{"id":"motivo","question":"¿Motivo de consulta?","type":"text"},{"id":"primera_vez","question":"¿Primera vez?","type":"boolean"}]'::jsonb,
  15,
  true,
  false,
  2,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_nutricion',
  'nutricion',
  'Nutrición',
  'Nutrition',
  'salud',
  'Health',
  '🥗',
  'Orientación nutricional y agenda de consultas.',
  'Nutritional guidance and appointment scheduling.',
  '{"system":"Eres asistente de nutrición.","instructions":["No diseñes planes sin consulta","Informa programas disponibles","Agenda citas","Motiva hábitos saludables"]}'::jsonb,
  '{"servicios":["consulta_inicial","plan_alimentacion","seguimiento","nutricion_deportiva","perdida_peso"]}'::jsonb,
  '[{"id":"objetivo","question":"¿Objetivo nutricional?","type":"select","options":["perder_peso","ganar_masa","mejorar_habitos","condicion_clinica","rendimiento_deportivo"]}]'::jsonb,
  15,
  true,
  false,
  3,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_compra_venta_inmueble',
  'compra_venta_inmueble',
  'Compra y Venta',
  'Buy & Sell',
  'inmobiliaria',
  'Real Estate',
  '🏠',
  'Asesor inmobiliario para compra y venta de propiedades.',
  'Real estate advisor for buying and selling.',
  '{"system":"Eres asesor inmobiliario experto en compra y venta.","instructions":["Pregunta presupuesto y zona","Explica proceso de compra","Informa financiamiento","Agenda visitas"]}'::jsonb,
  '{"tipos_inmueble":["apartamento","casa","local_comercial","oficina","terreno","galpon"],"etapas":["busqueda","visita","oferta","documentacion","cierre"]}'::jsonb,
  '[{"id":"operacion","question":"¿Comprar o vender?","type":"select","options":["comprar","vender","ambos"]},{"id":"zona","question":"¿Zona?","type":"text"},{"id":"presupuesto","question":"¿Presupuesto?","type":"text"}]'::jsonb,
  15,
  true,
  true,
  1,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_alquiler_temporal',
  'alquiler_temporal',
  'Alquiler Temporal',
  'Short-Term Rental',
  'inmobiliaria',
  'Real Estate',
  '🗓️',
  'Gestión de alquileres temporales: disponibilidad, tarifas y check-in.',
  'Short-term rental management.',
  '{"system":"Eres asistente de alquileres temporales.","instructions":["Consulta fechas y huéspedes","Informa normas","Explica proceso de reserva","Asiste durante estadía"]}'::jsonb,
  '{"etapas":["consulta_disponibilidad","cotizacion","reserva","check_in","estadia","check_out","valoracion"]}'::jsonb,
  '[{"id":"fechas","question":"¿Fechas de entrada y salida?","type":"text"},{"id":"huespedes","question":"¿Número de huéspedes?","type":"text"}]'::jsonb,
  15,
  true,
  false,
  2,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_ferreteria',
  'ferreteria',
  'Ferretería',
  'Hardware Store',
  'retail',
  'Retail',
  '🔨',
  'Asistente para ferreterías: productos, stock y precios.',
  'Hardware store assistant.',
  '{"system":"Eres asistente virtual de una ferretería.","instructions":["Pregunta para qué proyecto","Explica diferencias técnicas","Informa disponibilidad","Sugiere productos complementarios"]}'::jsonb,
  '{"categorias":["herramientas_manuales","herramientas_electricas","materiales_construccion","plomeria","electricidad","pintura","fijaciones"]}'::jsonb,
  '[{"id":"proyecto","question":"¿Para qué proyecto?","type":"text"},{"id":"producto","question":"¿Qué producto buscas?","type":"text"}]'::jsonb,
  15,
  true,
  false,
  1,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_ropa_calzado',
  'ropa_calzado',
  'Ropa y Calzado',
  'Clothing & Footwear',
  'retail',
  'Retail',
  '👗',
  'Asesor de moda: tallas, estilos y tendencias.',
  'Fashion advisor for clothing and footwear.',
  '{"system":"Eres asesor de moda de una tienda de ropa y calzado.","instructions":["Pregunta talla y ocasión","Sugiere combinaciones","Informa disponibilidad","Comparte tendencias"]}'::jsonb,
  '{"categorias":["camisas","pantalones","vestidos","ropa_deportiva","calzado_casual","calzado_formal","calzado_deportivo"]}'::jsonb,
  '[{"id":"genero","question":"¿Para quién?","type":"select","options":["hombre","mujer","nino","nina"]},{"id":"talla","question":"¿Talla?","type":"text"},{"id":"ocasion","question":"¿Ocasión?","type":"select","options":["casual","formal","deportivo","trabajo"]}]'::jsonb,
  15,
  true,
  false,
  2,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_farmacia',
  'farmacia',
  'Farmacia',
  'Pharmacy',
  'retail',
  'Retail',
  '💊',
  'Asistente farmacéutico: medicamentos e información.',
  'Pharmacy assistant.',
  '{"system":"Eres asistente de una farmacia.","instructions":["No recomiendas sin receta","Informa disponibilidad","Orienta sobre suplementos","Recomienda consultar médico"]}'::jsonb,
  '{"categorias":["medicamentos_otc","vitaminas_suplementos","cuidado_personal","bebe","dermatologia"]}'::jsonb,
  '[{"id":"producto","question":"¿Qué buscas?","type":"text"},{"id":"receta","question":"¿Tienes receta?","type":"boolean"}]'::jsonb,
  15,
  true,
  false,
  3,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_electrodomesticos_retail',
  'electrodomesticos_retail',
  'Electrodomésticos',
  'Home Appliances',
  'retail',
  'Retail',
  '📺',
  'Asesor de electrodomésticos: características, comparativas y garantías.',
  'Appliance and technology advisor.',
  '{"system":"Eres asesor de electrodomésticos y tecnología.","instructions":["Pregunta uso y espacio","Compara modelos","Informa garantía","Sugiere accesorios"]}'::jsonb,
  '{"categorias":["televisores","refrigeradores","lavadoras","aires_acondicionados","microondas","computadoras","celulares"]}'::jsonb,
  '[{"id":"producto","question":"¿Qué buscas?","type":"text"},{"id":"presupuesto","question":"¿Presupuesto?","type":"text"}]'::jsonb,
  15,
  true,
  false,
  4,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_ventas_foraneas',
  'ventas_foraneas',
  'Ventas Foráneas',
  'Field Sales',
  'empresas',
  'Enterprise Teams',
  '🚗',
  'Coordinador de ventas en campo: rutas, pedidos y reportes.',
  'Field sales team coordinator.',
  '{"system":"Eres coordinador virtual de ventas foráneas.","instructions":["Registra pedidos con cliente y productos","Consulta disponibilidad","Registra resultado de visita","Genera resúmenes diarios"]}'::jsonb,
  '{"flujo":["apertura_ruta","visita_cliente","toma_pedido","registro_resultado","cierre_ruta"]}'::jsonb,
  '[{"id":"vendedor","question":"¿Nombre y zona?","type":"text"},{"id":"tipo_registro","question":"¿Qué registras?","type":"select","options":["pedido","visita_sin_pedido","cobranza","incidencia"]}]'::jsonb,
  25,
  true,
  true,
  1,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_pedidos_internos',
  'pedidos_internos',
  'Gestión de Pedidos',
  'Order Management',
  'empresas',
  'Enterprise Teams',
  '📦',
  'Gestión de pedidos internos y coordinación entre áreas.',
  'Internal order management.',
  '{"system":"Eres asistente de gestión de pedidos internos.","instructions":["Registra solicitudes con área y urgencia","Consulta estados","Notifica pedidos urgentes","Resume pendientes"]}'::jsonb,
  '{"estados":["recibido","en_proceso","listo_despacho","despachado","entregado","cancelado"],"areas":["produccion","almacen","despacho","compras"]}'::jsonb,
  '[{"id":"solicitante","question":"¿Quién solicita y de qué área?","type":"text"},{"id":"urgencia","question":"¿Es urgente?","type":"boolean"}]'::jsonb,
  25,
  true,
  false,
  2,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_soporte_cliente',
  'soporte_cliente',
  'Soporte al Cliente',
  'Customer Support',
  'empresas',
  'Enterprise Teams',
  '🎧',
  'Agente de soporte: tickets, seguimiento y resolución.',
  'Customer support agent.',
  '{"system":"Eres agente de soporte al cliente.","instructions":["Escucha el problema completo","Registra ticket","Escala cuando sea necesario","Haz seguimiento proactivo"]}'::jsonb,
  '{"tipos_ticket":["consulta","queja","solicitud","soporte_tecnico","devolucion","facturacion"]}'::jsonb,
  '[{"id":"tipo","question":"¿Tipo de solicitud?","type":"select","options":["consulta","queja","soporte_tecnico","devolucion"]},{"id":"descripcion","question":"¿Describe el problema:","type":"text"}]'::jsonb,
  20,
  true,
  false,
  3,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Skill" ("id","key","name","nameEn","industry","industryEn","icon","description","descriptionEn","promptJson","mapJson","questionsJson","priceMonthly","isActive","isFeatured","sortOrder","createdAt","updatedAt")
VALUES (
  'skill_rrhh',
  'rrhh',
  'Recursos Humanos',
  'Human Resources',
  'empresas',
  'Enterprise Teams',
  '👥',
  'Asistente de RRHH: vacaciones, permisos y documentación.',
  'HR assistant.',
  '{"system":"Eres asistente de Recursos Humanos.","instructions":["Responde sobre políticas","Registra solicitudes de vacaciones","Informa onboarding","Orienta sobre documentación"]}'::jsonb,
  '{"tramites":["vacaciones","permiso_medico","permiso_personal","constancia_trabajo","onboarding"]}'::jsonb,
  '[{"id":"empleado","question":"¿Nombre y departamento?","type":"text"},{"id":"tramite","question":"¿Qué trámite necesitas?","type":"select","options":["vacaciones","permiso","constancia","consulta_politica"]}]'::jsonb,
  20,
  true,
  false,
  4,
  NOW(),
  NOW()
) ON CONFLICT ("key") DO NOTHING;
