export type HomeProduct = {
  href: string;
  image: string;
  alt: string;
  context: string;
  name: string;
  description: string;
  wide?: boolean;
};

export const transitionItems = [
  "Nickel alloys",
  "Drawing-based supply",
  "Critical service",
  "Inspection aligned",
  "Export ready",
] as const;

export const homeProducts: HomeProduct[] = [
  {
    href: "/products/bolts/hex-bolts/",
    image: "/assets/products/nickel-alloy-hex-bolts.jpg",
    alt: "High-temperature nickel-alloy hex bolts",
    context: "Heat and pressure",
    name: "Hex Bolts",
    description: "Machined and threaded to the applicable drawing or fastener standard.",
  },
  {
    href: "/products/studs/stud-bolts/",
    image: "/assets/products/nickel-alloy-stud-bolts.jpg",
    alt: "High-temperature nickel-alloy stud bolts",
    context: "Loaded joints",
    name: "Stud Bolts",
    description: "Full-thread and double-end configurations for engineered assemblies.",
  },
  {
    href: "/products/nuts/heavy-hex-nuts/",
    image: "/assets/products/nickel-alloy-hex-nuts.jpg",
    alt: "Precision nickel-alloy heavy hex nuts",
    context: "Matched threads",
    name: "Heavy Hex Nuts",
    description: "Thread and material combinations reviewed against the mating component.",
  },
  {
    href: "/products/washers/flat-washers/",
    image: "/assets/products/nickel-alloy-flat-washers.jpg",
    alt: "Precision nickel-alloy flat washers",
    context: "Load distribution",
    name: "Precision Washers",
    description: "Flat and drawing-based profiles in corrosion-resistant alloy grades.",
  },
  {
    href: "/products/custom-products/",
    image: "/assets/products/custom-alloy-fastener-components.jpg",
    alt: "Custom nickel-alloy fastener components and special threaded parts",
    context: "Drawing based",
    name: "Other & Custom",
    description: "Special heads, shoulders, threads and machined components developed from your requirement.",
    wide: true,
  },
];

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
    context: "Heat and pressure",
    name: "Energy & Petrochemical",
    description: "Bolting for valves, pumps, flanges and process systems.",
    image: "/assets/hero-fasteners.jpg",
  },
  {
    context: "Aggressive media",
    name: "Chemical Processing",
    description: "Alloy fasteners for corrosion-critical process equipment.",
    image: "/assets/quality-inspection.jpg",
  },
  {
    context: "Seawater exposure",
    name: "Marine & Offshore",
    description: "Material options for offshore maintenance and seawater-adjacent systems.",
    image: "/assets/product-fasteners.jpg",
  },
  {
    context: "Elevated temperature",
    name: "Power Generation",
    description: "Fasteners for thermal equipment and engineered plant assemblies.",
    image: "/assets/products/nickel-alloy-stud-bolts.jpg",
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
