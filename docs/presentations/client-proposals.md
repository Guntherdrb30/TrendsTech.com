# Interactive client proposals

Routes remain unchanged:
- `/es/propuestas/city-center-maracay`
- `/es/propuestas/big-home`

Both pages use `app/components/proposals/proposal-experience.tsx` and its scoped CSS module. Original capabilities and roadmaps are retained in `proposal-data.json`: four capabilities/five phases for City Center and six capabilities/six phases for Big Home.

Each proposal includes eight chapters, hash navigation, keyboard controls, fullscreen, accessible capability tabs, predefined conceptual AI scenarios, a CarpiHogar reference, implementation accordions, scope and the existing booking widget. No prices, performance metrics or delivery dates have been introduced. Existing booking source identifiers and WhatsApp destination are retained. No booking API changes.

`#vision`, `#plataforma`, `#demo`, `#reservar` and legacy `#reunion` remain usable. Noindex metadata remains; this is not an authentication mechanism.

Validation: isolated React/TypeScript compilation and Chromium checks of both pages at 1440, 390 and 320 pixels; chapter navigation, absence of horizontal content overflow, tabs and keyboard selection, scenario switching, exclusive phase accordion, direct booking link, booking UI with fixture availability (no submission), form-keyboard isolation and loaded images. Vercel preview build and production checks complete the integration gate.
