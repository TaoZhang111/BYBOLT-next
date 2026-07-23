export const siteOrigin = "https://alloyforge-fasteners-site.tao1461248574.workers.dev";

const images = {
  bolts: "/assets/products/nickel-alloy-hex-bolts.jpg",
  nuts: "/assets/products/nickel-alloy-hex-nuts.jpg",
  studs: "/assets/products/nickel-alloy-stud-bolts.jpg",
  washers: "/assets/products/nickel-alloy-flat-washers.jpg",
  screws: "/assets/product-fasteners.jpg",
  custom: "/assets/products/custom-alloy-fastener-components.jpg"
};

export const productCategories = [
  {
    slug: "bolts",
    name: "Bolts",
    index: "01",
    image: images.bolts,
    alt: "Nickel-alloy industrial bolts with precision machined threads",
    summary: "External-thread fasteners for structural, pressure and high-temperature assemblies.",
    intro: "Hex, heavy-hex, flange and drawing-based bolts reviewed around the joint, the alloy and the required inspection scope.",
    models: [
      {
        slug: "hex-bolts",
        name: "Hex Bolts",
        eyebrow: "General-purpose alloy bolt",
        description: "External hex-drive bolts for industrial assemblies and elevated-temperature service.",
        size: "M6-M64; 1/4-2 1/2 in",
        length: "20-500 mm; longer lengths by review",
        standard: "ASME B18.2.1, DIN 931/933, ISO 4014/4017 or drawing",
        configuration: "Full or partial thread",
        threads: "Metric coarse/fine, UNC, UNF, UN8"
      },
      {
        slug: "heavy-hex-bolts",
        name: "Heavy Hex Bolts",
        eyebrow: "High-bearing-area bolt",
        description: "Larger head geometry for high-load flange, structural and pressure-equipment joints.",
        size: "M12-M100; 1/2-4 in",
        length: "40-800 mm; project lengths by review",
        standard: "ASME B18.2.1, ASTM dimensional requirements or drawing",
        configuration: "Full or partial thread",
        threads: "Metric, UNC, UNF, UN8"
      },
      {
        slug: "flange-bolts",
        name: "Flange Bolts",
        eyebrow: "Integrated-bearing bolt",
        description: "Hex flange-head bolts designed to distribute bearing load without a separate washer.",
        size: "M6-M36; 1/4-1 1/2 in",
        length: "20-300 mm",
        standard: "DIN 6921, ISO 4162 or drawing",
        configuration: "Serrated or plain flange by specification",
        threads: "Metric coarse/fine, UNC, UNF"
      },
      {
        slug: "custom-bolts",
        name: "Custom Bolts",
        eyebrow: "Drawing-based bolt",
        description: "Special heads, shoulders, reduced shanks and non-standard threaded geometries made to drawing.",
        size: "Drawing-defined",
        length: "Drawing-defined",
        standard: "Customer drawing and agreed purchase specification",
        configuration: "Machined, forged or combined route after review",
        threads: "Standard or special thread forms"
      }
    ]
  },
  {
    slug: "nuts",
    name: "Nuts",
    index: "02",
    image: images.nuts,
    alt: "Nickel-alloy industrial nuts with internal threads",
    summary: "Matched internal-thread components for controlled preload and critical service.",
    intro: "Nut geometry, material pairing, thread class and proof requirements are reviewed against the mating fastener and assembly conditions.",
    models: [
      {
        slug: "hex-nuts",
        name: "Hex Nuts",
        eyebrow: "Standard-width nut",
        description: "Hexagonal nuts for general industrial bolting in corrosion and heat-critical systems.",
        size: "M6-M64; 1/4-2 1/2 in",
        length: "Standard nut height or drawing-defined",
        standard: "ASME B18.2.2, DIN 934, ISO 4032 or drawing",
        configuration: "Finished hex nut",
        threads: "Metric, UNC, UNF, UN8"
      },
      {
        slug: "heavy-hex-nuts",
        name: "Heavy Hex Nuts",
        eyebrow: "High-bearing-area nut",
        description: "Heavy-pattern nuts for pressure joints and large-diameter alloy bolting systems.",
        size: "M12-M100; 1/2-4 in",
        length: "Heavy-pattern height to standard or drawing",
        standard: "ASME B18.2.2, ASTM project requirements or drawing",
        configuration: "Heavy hex, chamfered faces",
        threads: "Metric, UNC, UNF, UN8"
      },
      {
        slug: "jam-nuts",
        name: "Jam Nuts",
        eyebrow: "Reduced-height lock nut",
        description: "Low-profile nuts used for locking, adjustment and constrained assembly envelopes.",
        size: "M6-M48; 1/4-2 in",
        length: "Reduced height to standard or drawing",
        standard: "ASME B18.2.2 or drawing",
        configuration: "Thin hex pattern",
        threads: "Metric, UNC, UNF"
      },
      {
        slug: "special-nuts",
        name: "Special Nuts",
        eyebrow: "Drawing-based nut",
        description: "Slotted, round, prevailing-torque and machined nut forms developed around the assembly.",
        size: "Drawing-defined",
        length: "Drawing-defined",
        standard: "Customer drawing and agreed specification",
        configuration: "Special external form or locking feature",
        threads: "Standard or special internal threads"
      }
    ]
  },
  {
    slug: "studs",
    name: "Studs",
    index: "03",
    image: images.studs,
    alt: "Nickel-alloy threaded studs for industrial flange connections",
    summary: "Stud bolts and threaded rods for flanges, pressure equipment and loaded joints.",
    intro: "Thread engagement, unthreaded body length, end configuration and traceability are controlled around the connected equipment.",
    models: [
      {
        slug: "stud-bolts",
        name: "Stud Bolts",
        eyebrow: "Pressure-joint stud",
        description: "Continuous-thread studs commonly paired with heavy hex nuts for flanged joints.",
        size: "M12-M100; 1/2-4 in",
        length: "100-2000 mm",
        standard: "ASME B16.5 project dimensions, ASTM requirements or drawing",
        configuration: "Continuous thread with chamfered ends",
        threads: "Metric, UNC, UNF, UN8"
      },
      {
        slug: "fully-threaded-studs",
        name: "Fully Threaded Studs",
        eyebrow: "Continuous-thread fastener",
        description: "Threaded across the full usable length for flexible engagement and positioning.",
        size: "M6-M64; 1/4-2 1/2 in",
        length: "50-2000 mm",
        standard: "DIN 976, ASTM project requirements or drawing",
        configuration: "Full thread",
        threads: "Metric, UNC, UNF, UN8"
      },
      {
        slug: "double-end-studs",
        name: "Double-End Studs",
        eyebrow: "Dual-engagement stud",
        description: "Threaded at both ends with a controlled plain shank between engagement zones.",
        size: "M8-M64; 5/16-2 1/2 in",
        length: "60-1000 mm",
        standard: "DIN 939 or drawing",
        configuration: "Equal or unequal thread lengths",
        threads: "Metric, UNC, UNF"
      },
      {
        slug: "threaded-rods",
        name: "Threaded Rods",
        eyebrow: "Long-form threaded stock",
        description: "Long continuous-thread components cut and finished to the specified installation length.",
        size: "M6-M64; 1/4-2 1/2 in",
        length: "Up to 3000 mm subject to alloy and diameter",
        standard: "DIN 976, ASTM project requirements or drawing",
        configuration: "Full thread, cut ends",
        threads: "Metric, UNC, UNF, UN8"
      },
      {
        slug: "tap-end-studs",
        name: "Tap-End Studs",
        eyebrow: "Asymmetric-engagement stud",
        description: "Machine studs with a short tap end and a nut end configured for equipment bodies.",
        size: "M8-M64; 5/16-2 1/2 in",
        length: "60-1000 mm",
        standard: "ASME B18.31.2 or drawing",
        configuration: "Tap end and nut end",
        threads: "Same or mixed thread series by drawing"
      },
      {
        slug: "custom-studs",
        name: "Custom Studs",
        eyebrow: "Drawing-based stud",
        description: "Special end forms, engagement lengths and unthreaded sections for proprietary equipment.",
        size: "Drawing-defined",
        length: "Drawing-defined",
        standard: "Customer drawing and agreed specification",
        configuration: "Custom thread zones and end details",
        threads: "Standard or special thread forms"
      }
    ]
  },
  {
    slug: "washers",
    name: "Washers",
    index: "04",
    image: images.washers,
    alt: "Precision nickel-alloy washers for load distribution",
    summary: "Flat, hardened and spring washer forms for load distribution and joint control.",
    intro: "Inside diameter, outside diameter, thickness, hardness and flatness are selected around the fastener and bearing surface.",
    models: [
      {
        slug: "flat-washers",
        name: "Flat Washers",
        eyebrow: "Load-distribution washer",
        description: "Plain washers in alloy grades for corrosion-resistant and high-temperature bolted joints.",
        size: "For M6-M100 and 1/4-4 in fasteners",
        length: "Thickness 1-20 mm typical",
        standard: "ASME B18.21.1, DIN 125, ISO 7089 or drawing",
        configuration: "Standard, large OD or close tolerance",
        threads: "Not applicable"
      },
      {
        slug: "hardened-washers",
        name: "Hardened Washers",
        eyebrow: "High-load washer",
        description: "Controlled-hardness washers for demanding bearing surfaces and high-preload joints.",
        size: "For M12-M100 and 1/2-4 in fasteners",
        length: "Thickness to standard or drawing",
        standard: "ASTM F436 dimensional basis or drawing",
        configuration: "Circular, clipped or bevelled by requirement",
        threads: "Not applicable"
      },
      {
        slug: "belleville-washers",
        name: "Belleville Washers",
        eyebrow: "Disc spring washer",
        description: "Conical spring washers for preload retention and controlled axial deflection.",
        size: "ID 6-100 mm typical",
        length: "Thickness and free height by load curve",
        standard: "DIN 2093 or drawing",
        configuration: "Single, nested or stacked arrangement",
        threads: "Not applicable"
      },
      {
        slug: "custom-washers",
        name: "Custom Washers",
        eyebrow: "Drawing-based washer",
        description: "Non-round, tabbed, stepped and precision-machined washer geometries made to drawing.",
        size: "Drawing-defined",
        length: "Drawing-defined thickness",
        standard: "Customer drawing and agreed specification",
        configuration: "Stamped, laser-cut or machined after review",
        threads: "Not applicable"
      }
    ]
  },
  {
    slug: "screws",
    name: "Screws",
    index: "05",
    image: images.screws,
    alt: "Precision threaded screw fasteners in a clean inspection setting",
    summary: "Socket, machine and set screw forms for compact and precision assemblies.",
    intro: "Drive form, head envelope, engagement length and point geometry are reviewed with the assembly drawing and service condition.",
    models: [
      {
        slug: "socket-head-cap-screws",
        name: "Socket Head Cap Screws",
        eyebrow: "Compact high-strength screw",
        description: "Cylindrical socket-head screws for limited-access and precision industrial assemblies.",
        size: "M3-M36; #4-1 1/2 in",
        length: "8-300 mm",
        standard: "ASME B18.3, DIN 912, ISO 4762 or drawing",
        configuration: "Full or partial thread",
        threads: "Metric, UNC, UNF"
      },
      {
        slug: "machine-screws",
        name: "Machine Screws",
        eyebrow: "Small-diameter assembly screw",
        description: "Pan, flat, fillister and other machine-screw heads for equipment and instrumentation.",
        size: "M2-M12; #2-1/2 in",
        length: "4-150 mm",
        standard: "ASME B18.6.3, DIN/ISO form or drawing",
        configuration: "Slotted, cross recess, hex socket or six-lobe",
        threads: "Metric, UNC, UNF"
      },
      {
        slug: "set-screws",
        name: "Set Screws",
        eyebrow: "Headless positioning screw",
        description: "Socket set screws for locating, locking and adjustment in compact mechanisms.",
        size: "M3-M24; #4-1 in",
        length: "4-100 mm",
        standard: "ASME B18.3, DIN 913-916 or drawing",
        configuration: "Cup, cone, flat, dog or custom point",
        threads: "Metric, UNC, UNF"
      },
      {
        slug: "custom-screws",
        name: "Custom Screws",
        eyebrow: "Drawing-based screw",
        description: "Special drive, head, shoulder and point combinations for proprietary assemblies.",
        size: "Drawing-defined",
        length: "Drawing-defined",
        standard: "Customer drawing and agreed specification",
        configuration: "Machined or cold-formed route after review",
        threads: "Standard or special thread forms"
      }
    ]
  },
  {
    slug: "custom-products",
    name: "Custom Products",
    index: "06",
    image: images.custom,
    alt: "Custom machined alloy fastener components produced from technical drawings",
    summary: "Drawing-based threaded parts and machined components outside standard catalogues.",
    intro: "The route begins with the drawing, service condition, alloy requirement, quantity and verification plan rather than a fixed catalogue assumption.",
    models: [
      {
        slug: "drawing-based-fasteners",
        name: "Drawing-Based Fasteners",
        eyebrow: "Build-to-print supply",
        description: "Fasteners produced around customer-controlled dimensions, notes and acceptance criteria.",
        size: "Drawing-defined",
        length: "Drawing-defined",
        standard: "Customer drawing and purchase specification",
        configuration: "Bolt, stud, nut, washer or hybrid geometry",
        threads: "Standard, modified or proprietary"
      },
      {
        slug: "special-thread-parts",
        name: "Special Thread Parts",
        eyebrow: "Non-standard threaded geometry",
        description: "Components with unusual pitch, lead, fit, handedness or engagement requirements.",
        size: "Drawing-defined",
        length: "Drawing-defined",
        standard: "Specified thread profile and inspection method",
        configuration: "Internal, external, left-hand or multi-start",
        threads: "Drawing-defined"
      },
      {
        slug: "machined-components",
        name: "Machined Components",
        eyebrow: "Precision alloy component",
        description: "Pins, sleeves, shoulders and turned parts supplied in heat- and corrosion-resistant alloys.",
        size: "Drawing-defined",
        length: "Drawing-defined",
        standard: "Customer drawing and agreed specification",
        configuration: "Turned, milled, drilled or combined features",
        threads: "As required"
      },
      {
        slug: "custom-assemblies",
        name: "Custom Assemblies",
        eyebrow: "Matched component set",
        description: "Fastener sets and matched components prepared as an order-specific assembly package.",
        size: "Assembly-defined",
        length: "Assembly-defined",
        standard: "Bill of materials, drawing and purchase specification",
        configuration: "Matched bolt, nut, washer and special components",
        threads: "Verified as a mating set"
      }
    ]
  }
];

export const sharedProductProperties = {
  materials: "Inconel 625, Inconel 718, Hastelloy C-276, Alloy 20 and specified nickel-based alloys",
  dimensionalControl: "Drawing, purchase specification and agreed product standard",
  inspection: "Dimensional inspection; PMI, hardness, tensile or additional testing when specified",
  documentation: "Material certificates, traceability and inspection records aligned with the quoted scope",
  unitWeight: "Calculated from final geometry and selected alloy density; confirmed on the quotation",
  packaging: "Piece count, net weight and gross shipment weight confirmed before dispatch"
};
