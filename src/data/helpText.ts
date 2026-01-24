// Help text and tooltips for non-construction professionals

export const helpText = {
  gcMarkup: "General Contractor markup covers project management, insurance, overhead, and profit. Typical range is 10-20%.",
  
  generalConditions: "General Conditions cover project-specific costs like temporary facilities, job site supervision, safety equipment, project management, and temporary utilities. Typically 6-10% of subtotal.",
  
  projectStatus: {
    Draft: "Initial planning stage - not yet started",
    Active: "Construction is currently underway",
    Completed: "Project finished",
    Archived: "Older project kept for reference"
  },
  
  unitTypes: {
    lf: "Linear Feet - measured in straight line distance (like wall length)",
    sqft: "Square Feet - measured by area (length × width)",
    each: "Per Item - price is for one complete unit",
    "lump sum": "Fixed Price - one total price for entire scope of work"
  },
  
  scopeDescriptions: {
    "10' Wall Framing and Drywall": "Includes: Wood or metal studs, drywall installation, joint compound, tape, and primer. Does NOT include paint, electrical, or insulation.",
    "8' Wall Framing and Drywall": "Standard ceiling height walls. Includes: Studs, drywall installation, joint compound, tape, and primer. Does NOT include paint, electrical, or insulation.",
    "Relocate Ducting/Grills": "Moving existing HVAC vents and ductwork to new locations. Includes: Labor and basic materials. Does NOT include new HVAC equipment.",
    "Flooring LVT": "Luxury Vinyl Tile flooring. Includes: Material, installation, and basic floor prep. Does NOT include subfloor repair or removal of existing flooring.",
    "Paint Ceilings": "Professional paint application on ceiling surfaces. Includes: Paint, labor, and minor prep. Does NOT include major repairs or texture matching.",
    "Paint Walls": "Professional paint application on wall surfaces. Includes: Paint, labor, and minor prep. Does NOT include major repairs or wallpaper removal.",
    "Door & Hardware": "Complete door unit. Includes: Door, frame, hinges, handle, lock, installation. Does NOT include specialized security hardware or smart locks.",
    "Plumbing Fixture": "Sink, toilet, or other plumbing fixture. Includes: Fixture, installation, basic supply lines. Does NOT include rough plumbing or major pipe relocation.",
    "Lighting Swap": "Replacing existing light fixtures. Includes: New fixture and installation. Does NOT include new wiring, electrical panel work, or specialty lighting.",
    "Millwork Allowance": "Budget allocation for custom cabinets, shelving, trim, or built-ins. Final cost determined after design selections.",
    "Permit/Design": "Budget for building permits, architectural drawings, and engineering. Required by most municipalities for commercial construction."
  },
  
  notIncluded: [
    "Furniture, fixtures & equipment (FF&E)",
    "Moving/relocation costs",
    "IT/Technology infrastructure",
    "Signage (exterior or interior)",
    "Landscaping or site work",
    "Structural work (beams, columns, foundations)",
    "Plans, permits, and fees (unless specifically included as line item)",
    "Low voltage systems (data, phone, AV, security)",
    "Hazardous material testing and abatement (asbestos, lead, mold)",
    "Concealed or unforeseen conditions",
    "Moisture mitigation or waterproofing",
    "Changes to locations, quantities, or types of finishes after budget approval",
    "Off-hours, overtime, holiday, or weekend labor rates",
    "Utility connection fees and impact fees",
    "Extended warranties or maintenance contracts",
    "Temporary facilities during construction",
    "Elevator or escalator work",
    "Specialty equipment or systems"
  ],
  
  budgetDisclaimer: "This is a preliminary budget estimate based on typical unit costs. Actual project costs may vary by ±15% depending on: site conditions, material selections, labor market, permit requirements, and project complexity. Always obtain detailed quotes from licensed contractors before making final decisions."
};

export interface ProjectTemplate {
  name: string;
  description: string;
  defaultGCMarkup: number;
  lineItems: {
    scopeName: string;
    quantity: number;
    notes: string;
  }[];
}

export const projectTemplates: ProjectTemplate[] = [
  {
    name: "Conceptual BLD w/ Pre-Packaged Assemblies",
    description: "Quick conceptual budget using pre-built assembly packages for offices, restrooms, breakrooms, and reception areas",
    defaultGCMarkup: 15,
    lineItems: []
  },
  {
    name: "Office Renovation",
    description: "Basic office refresh with new flooring, paint, and minor updates",
    defaultGCMarkup: 15,
    lineItems: [
      { scopeName: "Plans, Permits, and Fees (Small Office/Retail/Restaurant Space) <2000 sqft", quantity: 1, notes: "Typical for small office - select size based on your space" },
      { scopeName: "Demo Allowance (Small Office/Retail/Restaurant Space) <2000 sqft", quantity: 1, notes: "Remove existing finishes, furniture, etc." },
      { scopeName: "8' Metal Stud Wall + Sheetrock", quantity: 0, notes: "Standard height walls for offices/conference rooms - measure linear feet" },
      { scopeName: "Hollow Metal Frame + Hollow Metal Door + Hardware Installed", quantity: 0, notes: "Office doors, conference room doors, etc." },
      { scopeName: "Interior Paint (include total sqft of wall and ceiling being painted)", quantity: 0, notes: "Measure all wall and ceiling area to be painted" },
      { scopeName: "Carpet Tile", quantity: 0, notes: "Carpeted areas - measure floor area" },
      { scopeName: "Rubber Base", quantity: 0, notes: "Wall base trim - measure perimeter in linear feet" },
      { scopeName: "Accoustical Ceiling Grid and Tile", quantity: 0, notes: "Drop ceiling installation - measure ceiling area" },
      { scopeName: "Tenant Improvement General Electrical Distribution", quantity: 0, notes: "General electrical work - enter total square footage" },
      { scopeName: "Tentant Improvement Lighting Allowance", quantity: 0, notes: "Lighting package - enter total square footage" },
      { scopeName: "New General Duct Work and Distribution", quantity: 0, notes: "HVAC distribution - enter sqft if needed" },
      { scopeName: "Blocking / Backing Allowance", quantity: 1, notes: "Backing for wall-mounted items, TVs, shelving, etc." },
      { scopeName: "Finish Carpentry Allowance (Small Office/Retail/Restaurant Space) <2000 sqft", quantity: 1, notes: "Base molding, door trim, built-ins as needed" }
    ]
  },
  {
    name: "Retail Store Buildout",
    description: "Complete retail space transformation with new walls, finishes, and fixtures",
    defaultGCMarkup: 15,
    lineItems: [
      { scopeName: "Plans, Permits, and Fees (Mid Size Office/Retail/Restaurant Space)  2001 - 3500 sqft", quantity: 1, notes: "Typical for mid-size retail - adjust based on square footage" },
      { scopeName: "Demo Allowance (Mid Size Office/Retail/Restaurant Space) 2001 - 3500 sqft", quantity: 1, notes: "Clear out existing retail space" },
      { scopeName: "8' Metal Stud Wall + Sheetrock", quantity: 0, notes: "Sales floor partitions and back office - measure linear feet" },
      { scopeName: "Alluminum Storefront Doors 3'0'' x 7'0'' (standard hardware)", quantity: 0, notes: "Entry doors - count how many needed" },
      { scopeName: "Alluminum Storefront Windows", quantity: 0, notes: "Storefront glass - measure square feet" },
      { scopeName: "Hollow Metal Frame + Hollow Metal Door + Hardware Installed", quantity: 0, notes: "Interior doors for office, storage, restrooms" },
      { scopeName: "Interior Paint (include total sqft of wall and ceiling being painted)", quantity: 0, notes: "All interior surfaces - calculate total area" },
      { scopeName: "Exterior Paint", quantity: 0, notes: "Storefront exterior if needed" },
      { scopeName: "LVT", quantity: 0, notes: "Sales floor and back areas" },
      { scopeName: "Rubber Base", quantity: 0, notes: "Wall base - measure perimeter" },
      { scopeName: "Accoustical Ceiling Grid and Tile", quantity: 0, notes: "Ceiling system - measure area" },
      { scopeName: "Tenant Improvement General Electrical Distribution", quantity: 0, notes: "General electrical - enter total sqft" },
      { scopeName: "Tentant Improvement Lighting Allowance", quantity: 0, notes: "Retail lighting - enter sqft for comprehensive lighting" },
      { scopeName: "Tenant Improvement (new fixtures including necessary underground and overhead work)", quantity: 0, notes: "Restroom plumbing - count fixtures" },
      { scopeName: "New General Duct Work and Distribution", quantity: 0, notes: "HVAC distribution - enter sqft if major work needed" },
      { scopeName: "Finish Carpentry Allowance (Mid Size Office/Retail/Restaurant Space) 2001 - 3500 sqft", quantity: 1, notes: "Sales counter, display elements, trim work" },
      { scopeName: "Bathroom Partitions (2 Restrooms: 3 stalls and 1 Urinal Screen)", quantity: 0, notes: "Restroom stalls if needed" },
      { scopeName: "Bathroom Accessories per RR", quantity: 0, notes: "Mirrors, dispensers, etc. - count restrooms" }
    ]
  },
  {
    name: "Restaurant Buildout",
    description: "Full restaurant build including kitchen, dining, and restrooms",
    defaultGCMarkup: 15,
    lineItems: [
      { scopeName: "Plans, Permits, and Fees (Mid Size Office/Retail/Restaurant Space)  2001 - 3500 sqft", quantity: 1, notes: "Restaurant permits including health department" },
      { scopeName: "Demo Allowance (Mid Size Office/Retail/Restaurant Space) 2001 - 3500 sqft", quantity: 1, notes: "Complete gut of existing space" },
      { scopeName: "Concrete Cutting - 2' Trench (Cut/Remove/Dispose)", quantity: 0, notes: "For new plumbing runs to kitchen - measure linear feet" },
      { scopeName: "Concrete Trench Patch Back (4'' slab)", quantity: 0, notes: "Patch trenches - matches trench length" },
      { scopeName: "8' Metal Stud Wall + Sheetrock", quantity: 0, notes: "Dining area, kitchen, office partitions" },
      { scopeName: "Hollow Metal Frame + Hollow Metal Door + Hardware Installed", quantity: 0, notes: "Kitchen doors, office, storage, restrooms" },
      { scopeName: "Interior Paint (include total sqft of wall and ceiling being painted)", quantity: 0, notes: "All dining and BOH areas" },
      { scopeName: "Tile", quantity: 0, notes: "Kitchen floor and walls - calculate area" },
      { scopeName: "LVT", quantity: 0, notes: "Dining room flooring" },
      { scopeName: "Floor Prep", quantity: 0, notes: "Level and prep floors before finish flooring" },
      { scopeName: "Rubber Base", quantity: 0, notes: "Wall base throughout - measure perimeter" },
      { scopeName: "Accoustical Ceiling Grid and Tile", quantity: 0, notes: "Dining room ceiling" },
      { scopeName: "Tenant Improvement General Electrical Distribution", quantity: 0, notes: "Heavy electrical for kitchen equipment - enter sqft" },
      { scopeName: "Tentant Improvement Lighting Allowance", quantity: 0, notes: "Dining and kitchen lighting - enter sqft" },
      { scopeName: "Tenant Improvement (new fixtures including necessary underground and overhead work)", quantity: 0, notes: "Kitchen sinks, prep sinks, hand sinks, restrooms - count all fixtures" },
      { scopeName: "New General Duct Work and Distribution", quantity: 0, notes: "HVAC for dining - enter sqft" },
      { scopeName: "New RTU", quantity: 0, notes: "Rooftop HVAC units - count how many needed" },
      { scopeName: "RTU Supports (steel) Installed", quantity: 0, notes: "Structural supports for RTUs" },
      { scopeName: "Membrane Roof Patching (RTU)", quantity: 0, notes: "Seal roof around new RTUs - count units" },
      { scopeName: "Fire Alarm Allowance", quantity: 1, notes: "Required for restaurants" },
      { scopeName: "Sprinkler Design and Permit (require if any heads to be relocated)", quantity: 1, notes: "Required if layout changes" },
      { scopeName: "Relocate Exisitng Heads", quantity: 0, notes: "Count sprinkler heads to relocate" },
      { scopeName: "Finish Carpentry Allowance (Mid Size Office/Retail/Restaurant Space) 2001 - 3500 sqft", quantity: 1, notes: "Host stand, trim, millwork" },
      { scopeName: "Bathroom Partitions (2 Restrooms: 3 stalls and 1 Urinal Screen)", quantity: 1, notes: "Typically 2 restrooms for restaurant" },
      { scopeName: "Bathroom Accessories per RR", quantity: 2, notes: "2 restrooms typically" }
    ]
  },
  {
    name: "Medical Office Suite",
    description: "Professional medical office with exam rooms and waiting area",
    defaultGCMarkup: 15,
    lineItems: [
      { scopeName: "Plans, Permits, and Fees (Mid Size Office/Retail/Restaurant Space)  2001 - 3500 sqft", quantity: 1, notes: "Medical office permits - adjust size as needed" },
      { scopeName: "Demo Allowance (Mid Size Office/Retail/Restaurant Space) 2001 - 3500 sqft", quantity: 1, notes: "Remove existing office build-out" },
      { scopeName: "8' Metal Stud Wall + Sheetrock", quantity: 0, notes: "Exam rooms, private offices, reception - measure linear feet" },
      { scopeName: "Hollow Metal Frame + Hollow Metal Door + Hardware Installed", quantity: 0, notes: "Exam rooms, offices, restrooms - count doors needed" },
      { scopeName: "Interior Paint (include total sqft of wall and ceiling being painted)", quantity: 0, notes: "All walls and ceilings" },
      { scopeName: "LVT", quantity: 0, notes: "Medical grade flooring throughout" },
      { scopeName: "Rubber Base", quantity: 0, notes: "Wall base - measure perimeter" },
      { scopeName: "Accoustical Ceiling Grid and Tile", quantity: 0, notes: "Clean room ceiling system" },
      { scopeName: "Tenant Improvement General Electrical Distribution", quantity: 0, notes: "Medical equipment electrical - enter sqft" },
      { scopeName: "Tentant Improvement Lighting Allowance", quantity: 0, notes: "Medical office lighting - enter sqft" },
      { scopeName: "Tenant Improvement (new fixtures including necessary underground and overhead work)", quantity: 0, notes: "Exam room sinks, restroom fixtures - count all" },
      { scopeName: "New General Duct Work and Distribution", quantity: 0, notes: "HVAC adjustments - enter sqft if needed" },
      { scopeName: "Sound Insulation", quantity: 0, notes: "HIPAA privacy - measure wall area needing sound control" },
      { scopeName: "Finish Carpentry Allowance (Mid Size Office/Retail/Restaurant Space) 2001 - 3500 sqft", quantity: 1, notes: "Reception desk, casework, cabinetry" },
      { scopeName: "Bathroom Accessories per RR", quantity: 2, notes: "Patient and staff restrooms" },
      { scopeName: "Low Voltage Allowance", quantity: 1, notes: "Data/phone infrastructure" }
    ]
  }
];

export const benchmarkData = {
  costPerSqFt: {
    office: { min: 75, max: 125, average: 100 },
    retail: { min: 75, max: 125, average: 100 },
    restaurant: { min: 125, max: 200, average: 162.5 },
    medical: { min: 100, max: 175, average: 137.5 }
  }
};
