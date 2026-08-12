export type ManufacturingStage = {
  id: string;
  number: string;
  title: string;
  summary: string;
  control: string;
};

export const manufacturingStages: ManufacturingStage[] = [
  {
    id: "material-verification",
    number: "01",
    title: "Material Verification",
    summary: "Incoming alloy identity, heat and lot references are checked before material enters production.",
    control: "Review the purchase specification, material certificate, dimensions and identification against the released order.",
  },
  {
    id: "cutting",
    number: "02",
    title: "Cutting",
    summary: "Verified stock is separated into controlled blanks for the required fastener or machined component.",
    control: "Blank dimensions, material identity and production quantity remain linked to the active heat or lot record.",
  },
  {
    id: "forming",
    number: "03",
    title: "Forming",
    summary: "Heads and primary geometry are formed through the qualified route selected for the alloy and drawing.",
    control: "Process parameters, tooling and intermediate dimensions are checked before the parts move to thermal processing.",
  },
  {
    id: "heat-treatment",
    number: "04",
    title: "Heat Treatment",
    summary: "Thermal cycles establish the specified material condition and required mechanical performance.",
    control: "Furnace records, load identity, cycle requirements and applicable test results are retained with the production lot.",
  },
  {
    id: "cnc-turning",
    number: "05",
    title: "CNC Turning",
    summary: "Threads, shoulders and drawing-defined features are machined to the released dimensions and tolerances.",
    control: "Tooling, thread requirements and critical dimensions are monitored against the drawing and inspection plan.",
  },
  {
    id: "cleaning",
    number: "06",
    title: "Cleaning",
    summary: "Process residue and handling contamination are removed before final inspection and packaging.",
    control: "The cleaning method is selected for the alloy, surface condition and any order-specific cleanliness requirement.",
  },
  {
    id: "inspection",
    number: "07",
    title: "Inspection",
    summary: "Finished parts are checked against dimensional, material and testing requirements agreed with the order.",
    control: "Dimensional records, PMI, hardness, mechanical tests or third-party review are assembled when specified.",
  },
  {
    id: "marking-packaging",
    number: "08",
    title: "Marking & Packaging",
    summary: "Accepted parts receive the confirmed identification and are packed for protected, traceable dispatch.",
    control: "Piece count, package labels, heat or lot references and the final document set are reconciled before shipment.",
  },
];
