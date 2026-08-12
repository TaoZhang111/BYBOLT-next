export const transitionItems = [
  "Nickel alloys",
  "Drawing-based supply",
  "Critical service",
  "Inspection aligned",
  "Export ready",
] as const;

export const requirementRoutes = [
  {
    number: "01",
    title: "Find a fastener",
    description: "Browse bolts, studs, nuts, washers and special parts, then narrow by material and standard.",
    action: "Browse fasteners",
    href: "/products",
  },
  {
    number: "02",
    title: "Select a material",
    description: "Compare corrosion, strength and temperature positioning before reviewing a specific grade.",
    action: "Compare alloys",
    href: "/alloys",
  },
  {
    number: "03",
    title: "Build to drawing",
    description: "Send dimensions, service conditions, testing requirements and a drawing for technical review.",
    action: "Start technical RFQ",
    href: "/request-a-quote",
  },
] as const;

export const capabilities = [
  ["Drawing review", "Dimensions, tolerances and thread form", "Technical inputs are checked before commercial quotation."],
  ["Process planning", "Machining and thread production", "Manufacturing routes are selected to suit the specified grade and geometry."],
  ["Order assurance", "Inspection and documentation", "Traceability and test records are aligned with the agreed purchase scope."],
  ["Export delivery", "Packing and shipment preparation", "Labels, protection and delivery documents are prepared for the destination."],
] as const;

export const qualityPoints = [
  "MTC / EN 10204 3.1 when specified",
  "Heat and lot traceability",
  "PMI, hardness and tensile testing",
  "Third-party inspection coordination",
] as const;

export const industries = [
  {
    name: "Chemical Processing",
    image: "/assets/industries/chemical-processing.webp",
  },
  {
    name: "Marine & Offshore",
    image: "/assets/industries/marine-offshore.webp",
  },
  {
    name: "Power Generation",
    image: "/assets/industries/power-generation.webp",
  },
  {
    name: "Aerospace",
    image: "/assets/industries/aerospace.webp",
  },
] as const;

export const processSteps = [
  {
    number: "01",
    title: "Upload Drawing",
    description: "Send the specification, drawing, material and required quantity.",
    image: "/assets/quality-inspection.jpg",
    alt: "Technical review of a nickel-alloy bolt requirement",
  },
  {
    number: "02",
    title: "Technical Review",
    description: "Confirm geometry, alloy condition, testing scope and manufacturing feasibility.",
    image: "/assets/product-fasteners.jpg",
    alt: "Fastener geometry and alloy selection review",
  },
  {
    number: "03",
    title: "Quotation",
    description: "Receive the proposed supply scope, pricing, lead time and commercial terms.",
    image: "/assets/products/nickel-alloy-hex-bolts.jpg",
    alt: "Nickel-alloy bolt supply scope prepared for quotation",
  },
  {
    number: "04",
    title: "Production & QC",
    description: "Coordinate manufacturing, dimensional inspection, testing and traceability records.",
    image: "/assets/hero-fasteners.jpg",
    alt: "Alloy fastener production and inspection preparation",
  },
  {
    number: "05",
    title: "Shipment",
    description: "Prepare protected export packing, labels and destination-ready documents.",
    image: "/assets/products/custom-alloy-fastener-components.jpg",
    alt: "Finished alloy fastener components prepared for export shipment",
  },
] as const;
