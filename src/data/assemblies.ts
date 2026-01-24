// Pre-configured assemblies (packages) that GCs commonly need together
export interface AssemblyItem {
  scopeName: string;
  quantity: number;
  notes?: string;
}

export interface ScaleDiscount {
  minQty: number;
  maxQty: number;
  discountPercent: number;
}

export interface Assembly {
  id: string;
  name: string;
  description: string;
  category: string;
  items: AssemblyItem[];
  scaleDiscounts?: ScaleDiscount[]; // Optional: quantity-based discount tiers
  squareFeet?: number; // Optional: footprint of the assembly for common area calculations
  hasConditionalBaselineMultiplier?: boolean; // If true, baseline multiplier only applies when this is the only assembly type
}

export const assemblies: Assembly[] = [
  {
    id: 'private-office-8x10',
    name: '8x10 Private Office',
    description: 'Complete office space with walls, door, finishes, and flooring',
    category: 'Office',
    squareFeet: 80, // 8x10 office footprint
    scaleDiscounts: [],
    items: [
      { scopeName: '10\' Metal Stud Wall + Sheetrock', quantity: 36, notes: '36 LF perimeter walls' },
      { scopeName: 'Hollow Metal Frame + Hollow Metal Door + Hardware Installed', quantity: 1, notes: '1 door for office entry' },
      { scopeName: 'Accoustical Ceiling Grid and Tile', quantity: 80, notes: '80 SF ceiling' },
      { scopeName: 'Interior Paint (include total sqft of wall and ceiling being painted)', quantity: 360, notes: '360 SF walls' },
      { scopeName: 'Carpet Tile', quantity: 80, notes: '80 SF floor' },
      { scopeName: 'Rubber Base', quantity: 36, notes: '36 LF perimeter' },
      { scopeName: 'General Electrical Distribution for Tenant Improvement', quantity: 80, notes: '80 SF electrical distribution' },
      { scopeName: 'New General Duct Work and Distribution', quantity: 80, notes: '80 SF duct work distribution and return' },
    ],
  },
  {
    id: 'private-office',
    name: '10x10 Private Office',
    description: 'Complete office space with walls, door, finishes, and flooring',
    category: 'Office',
    squareFeet: 100, // 10x10 office footprint
    scaleDiscounts: [],
    items: [
      { scopeName: '10\' Metal Stud Wall + Sheetrock', quantity: 40, notes: '40 LF perimeter walls' },
      { scopeName: 'Hollow Metal Frame + Hollow Metal Door + Hardware Installed', quantity: 1, notes: '1 door for office entry' },
      { scopeName: 'Accoustical Ceiling Grid and Tile', quantity: 100, notes: '100 SF ceiling' },
      { scopeName: 'Interior Paint (include total sqft of wall and ceiling being painted)', quantity: 400, notes: '400 SF walls' },
      { scopeName: 'Carpet Tile', quantity: 100, notes: '100 SF floor' },
      { scopeName: 'Rubber Base', quantity: 40, notes: '40 LF perimeter' },
      { scopeName: 'General Electrical Distribution for Tenant Improvement', quantity: 100, notes: '100 SF electrical distribution' },
      { scopeName: 'New General Duct Work and Distribution', quantity: 100, notes: '100 SF duct work distribution and return' },
    ],
  },
  {
    id: 'private-office-12x14',
    name: '12x14 Private Office',
    description: 'Complete office space with walls, door, finishes, and flooring',
    category: 'Office',
    squareFeet: 168, // 12x14 office footprint
    scaleDiscounts: [],
    items: [
      { scopeName: '10\' Metal Stud Wall + Sheetrock', quantity: 52, notes: '52 LF perimeter walls' },
      { scopeName: 'Hollow Metal Frame + Hollow Metal Door + Hardware Installed', quantity: 1, notes: '1 door for office entry' },
      { scopeName: 'Accoustical Ceiling Grid and Tile', quantity: 168, notes: '168 SF ceiling' },
      { scopeName: 'Interior Paint (include total sqft of wall and ceiling being painted)', quantity: 520, notes: '520 SF walls' },
      { scopeName: 'Carpet Tile', quantity: 168, notes: '168 SF floor' },
      { scopeName: 'Rubber Base', quantity: 52, notes: '52 LF perimeter' },
      { scopeName: 'General Electrical Distribution for Tenant Improvement', quantity: 168, notes: '168 SF electrical distribution' },
      { scopeName: 'New General Duct Work and Distribution', quantity: 168, notes: '168 SF duct work distribution and return' },
    ],
  },
  {
    id: 'breakroom',
    name: 'Breakroom (175 SF)',
    description: 'Complete breakroom with cabinets, countertops, appliances, plumbing, and finishes',
    category: 'Breakroom',
    squareFeet: 175, // 175 SF footprint
    scaleDiscounts: [],
    items: [
      { scopeName: '10\' Metal Stud Wall + Sheetrock', quantity: 38, notes: '38 LF perimeter walls' },
      { scopeName: 'Upper and Lower Cabinets', quantity: 10, notes: '10 LF of upper and lower cabinets' },
      { scopeName: 'Solid Surface Counter Tops', quantity: 20, notes: '20 SF solid surface countertops' },
      { scopeName: 'New plumbing fixtures including necessary underground and overhead work', quantity: 2, notes: 'Sink and connections' },
      { scopeName: 'Refrigerator (includes appliance and electrical connection)', quantity: 1, notes: 'Breakroom refrigerator with hookup' },
      { scopeName: 'Dishwasher (includes appliance and electrical connection)', quantity: 1, notes: 'Breakroom dishwasher with hookup' },
      { scopeName: 'LVT', quantity: 175, notes: '175 SF flooring' },
      { scopeName: 'Rubber Base', quantity: 53, notes: '53 LF perimeter' },
      { scopeName: 'General Electrical Distribution for Tenant Improvement', quantity: 175, notes: '175 SF electrical distribution' },
      { scopeName: 'Lighting Allowance for Tentant Improvement', quantity: 175, notes: '175 SF lighting' },
      { scopeName: 'New General Duct Work and Distribution', quantity: 175, notes: '175 SF duct work distribution' },
    ],
  },
  {
    id: 'single-restroom',
    name: 'Single Occupancy Restroom (8x8)',
    description: 'Complete ADA-compliant restroom with toilet, sink, accessories, and finishes',
    category: 'Restrooms',
    squareFeet: 64, // 8x8 restroom footprint
    hasConditionalBaselineMultiplier: true, // Remove 1.2x multiplier when part of larger buildout
    scaleDiscounts: [
      { minQty: 1, maxQty: 999, discountPercent: -20 },  // Always run at 1.2x unit cost
    ],
    items: [
      { scopeName: '10\' Metal Stud Wall + Sheetrock', quantity: 24, notes: '24 LF perimeter walls + drywall ceiling' },
      { scopeName: 'Hollow Metal Frame + Hollow Metal Door + Hardware Installed', quantity: 1, notes: '1 door for restroom entry' },
      { scopeName: 'Interior Paint (include total sqft of wall and ceiling being painted)', quantity: 256, notes: '192 SF walls + 64 SF ceiling' },
      { scopeName: 'LVT', quantity: 64, notes: '64 SF floor' },
      { scopeName: 'Rubber Base', quantity: 24, notes: '24 LF perimeter' },
      { scopeName: 'New plumbing fixtures including necessary underground and overhead work', quantity: 3, notes: 'Toilet, sink, grab bars' },
      { scopeName: 'Bathroom Accessories per RR', quantity: 1, notes: 'Paper towel, TP holder, etc.' },
      { scopeName: 'General Electrical Distribution for Tenant Improvement', quantity: 64, notes: '64 SF electrical distribution' },
      { scopeName: 'New Exhaust Fan', quantity: 1, notes: 'Restroom exhaust fan' },
    ],
  },
  {
    id: 'multi-user-restrooms',
    name: 'Separate Multi User Men\'s and Women\'s Restrooms',
    description: 'Two 10x12 restrooms - Men\'s (1 toilet, 1 urinal, 1 sink) and Women\'s (2 toilets, 1 sink)',
    category: 'Restrooms',
    squareFeet: 240, // 120 SF men's + 120 SF women's
    scaleDiscounts: [],
    items: [
      { scopeName: '10\' Metal Stud Wall + Sheetrock', quantity: 108, notes: '88 LF perimeter walls (44 LF each) + 20 LF interior partition walls' },
      { scopeName: 'Hollow Metal Frame + Hollow Metal Door + Hardware Installed', quantity: 2, notes: '1 door per restroom' },
      { scopeName: 'Interior Paint (include total sqft of wall and ceiling being painted)', quantity: 1120, notes: '880 SF walls + 240 SF ceilings (both restrooms)' },
      { scopeName: 'LVT', quantity: 240, notes: '120 SF men\'s + 120 SF women\'s' },
      { scopeName: 'Rubber Base', quantity: 88, notes: '44 LF perimeter per restroom' },
      { scopeName: 'New plumbing fixtures including necessary underground and overhead work', quantity: 8, notes: 'Men\'s: 1 toilet, 1 sink, 1 urinal, 1 floor drain. Women\'s: 2 toilets, 1 sink, 1 floor sink' },
      { scopeName: 'Bathroom Accessories per RR', quantity: 2, notes: '$1500 total for both restrooms - mirrors, dispensers, grab bars, etc.' },
      { scopeName: 'Bathroom Partitions (2 Restrooms: 3 stalls and 1 Urinal Screen)', quantity: 1, notes: 'Partitions for both restrooms' },
      { scopeName: 'General Electrical Distribution for Tenant Improvement', quantity: 240, notes: '240 SF electrical distribution (both restrooms)' },
      { scopeName: 'New Exhaust Fan', quantity: 2, notes: '1 exhaust fan per restroom' },
    ],
  },
  {
    id: 'reception-small',
    name: 'Small Reception Area (100 SF)',
    description: 'Reception area with desk, finishes, and signage - elevated finish quality',
    category: 'Reception Area',
    squareFeet: 100,
    hasConditionalBaselineMultiplier: true, // Remove 1.1x multiplier when part of larger buildout
    scaleDiscounts: [
      { minQty: 1, maxQty: 999, discountPercent: -10 },  // Always run at 1.1x unit cost for elevated finishes
    ],
    items: [
      { scopeName: 'Upper and Lower Cabinets', quantity: 10, notes: '10 LF reception desk base cabinets' },
      { scopeName: 'Solid Surface Counter Tops', quantity: 20, notes: '20 SF reception counter' },
      { scopeName: 'Accoustical Ceiling Grid and Tile', quantity: 100, notes: '100 SF ceiling' },
      { scopeName: 'Interior Paint (include total sqft of wall and ceiling being painted)', quantity: 200, notes: '200 SF (2 walls only)' },
      { scopeName: 'Carpet Tile', quantity: 100, notes: '100 SF floor' },
      { scopeName: 'Rubber Base', quantity: 40, notes: '40 LF perimeter' },
      { scopeName: 'General Electrical Distribution for Tenant Improvement', quantity: 100, notes: '100 SF electrical distribution' },
      { scopeName: 'New Troffer Lighting', quantity: 100, notes: '100 SF lighting' },
      { scopeName: 'New General Duct Work and Distribution', quantity: 100, notes: '100 SF duct work distribution' },
      { scopeName: 'Signage', quantity: 1, notes: '$2500 allowance for company signage and wayfinding' },
    ],
  },
  {
    id: 'reception-medium',
    name: 'Medium Reception Area (200 SF)',
    description: 'Reception area with desk, finishes, and signage - elevated finish quality',
    category: 'Reception Area',
    squareFeet: 200,
    hasConditionalBaselineMultiplier: true, // Remove 1.1x multiplier when part of larger buildout
    scaleDiscounts: [
      { minQty: 1, maxQty: 999, discountPercent: -10 },  // Always run at 1.1x unit cost for elevated finishes
    ],
    items: [
      { scopeName: 'Upper and Lower Cabinets', quantity: 10, notes: '10 LF reception desk base cabinets' },
      { scopeName: 'Solid Surface Counter Tops', quantity: 20, notes: '20 SF reception counter' },
      { scopeName: 'Accoustical Ceiling Grid and Tile', quantity: 200, notes: '200 SF ceiling' },
      { scopeName: 'Interior Paint (include total sqft of wall and ceiling being painted)', quantity: 280, notes: '280 SF (2 walls only)' },
      { scopeName: 'Carpet Tile', quantity: 200, notes: '200 SF floor' },
      { scopeName: 'Rubber Base', quantity: 56, notes: '56 LF perimeter' },
      { scopeName: 'General Electrical Distribution for Tenant Improvement', quantity: 200, notes: '200 SF electrical distribution' },
      { scopeName: 'New Troffer Lighting', quantity: 200, notes: '200 SF lighting' },
      { scopeName: 'New General Duct Work and Distribution', quantity: 200, notes: '200 SF duct work distribution' },
      { scopeName: 'Signage', quantity: 1, notes: '$2500 allowance for company signage and wayfinding' },
    ],
  },
  {
    id: 'reception-large',
    name: 'Large Reception Area (300 SF)',
    description: 'Reception area with desk, finishes, and signage - elevated finish quality',
    category: 'Reception Area',
    squareFeet: 300,
    hasConditionalBaselineMultiplier: true, // Remove 1.1x multiplier when part of larger buildout
    scaleDiscounts: [
      { minQty: 1, maxQty: 999, discountPercent: -10 },  // Always run at 1.1x unit cost for elevated finishes
    ],
    items: [
      { scopeName: 'Upper and Lower Cabinets', quantity: 10, notes: '10 LF reception desk base cabinets' },
      { scopeName: 'Solid Surface Counter Tops', quantity: 20, notes: '20 SF reception counter' },
      { scopeName: 'Accoustical Ceiling Grid and Tile', quantity: 300, notes: '300 SF ceiling' },
      { scopeName: 'Interior Paint (include total sqft of wall and ceiling being painted)', quantity: 340, notes: '340 SF (2 walls only)' },
      { scopeName: 'Carpet Tile', quantity: 300, notes: '300 SF floor' },
      { scopeName: 'Rubber Base', quantity: 68, notes: '68 LF perimeter' },
      { scopeName: 'General Electrical Distribution for Tenant Improvement', quantity: 300, notes: '300 SF electrical distribution' },
      { scopeName: 'New Troffer Lighting', quantity: 300, notes: '300 SF lighting' },
      { scopeName: 'New General Duct Work and Distribution', quantity: 300, notes: '300 SF duct work distribution' },
      { scopeName: 'Signage', quantity: 1, notes: '$2500 allowance for company signage and wayfinding' },
    ],
  },
];

// Extract unique categories from assemblies
export const assemblyCategories = Array.from(new Set(assemblies.map(a => a.category)));

// Helper function to create a dynamic common area assembly based on calculated square footage
export function createCommonAreaAssembly(commonAreaSqft: number): Assembly {
  // Calculate perimeter assuming a square space
  const singleWallLength = Math.round(Math.sqrt(commonAreaSqft));
  const perimeterLF = singleWallLength * 4;
  const wallPaintSF = perimeterLF * 10; // 10' tall walls
  const lightingQty = Math.ceil(commonAreaSqft / 100); // 1 light per 100 SF
  
  return {
    id: 'common-area-dynamic',
    name: `Common Area (${commonAreaSqft} SF)`,
    description: `Shared space finishes calculated from remaining square footage after deducting offices and restrooms`,
    category: 'Common Area',
    squareFeet: commonAreaSqft,
    scaleDiscounts: [],
    items: [
      { 
        scopeName: 'Accoustical Ceiling Grid and Tile', 
        quantity: commonAreaSqft, 
        notes: `${commonAreaSqft} SF ceiling` 
      },
      { 
        scopeName: 'Interior Paint (include total sqft of wall and ceiling being painted)', 
        quantity: wallPaintSF,
        notes: `${perimeterLF} LF perimeter × 10' tall = ${wallPaintSF} SF walls only` 
      },
      { 
        scopeName: 'Carpet Tile', 
        quantity: commonAreaSqft, 
        notes: `${commonAreaSqft} SF floor` 
      },
      { 
        scopeName: 'Rubber Base', 
        quantity: perimeterLF, 
        notes: `${perimeterLF} LF perimeter` 
      },
      { 
        scopeName: 'General Electrical Distribution for Tenant Improvement', 
        quantity: commonAreaSqft, 
        notes: `${commonAreaSqft} SF electrical distribution` 
      },
      { 
        scopeName: 'New Troffer Lighting', 
        quantity: commonAreaSqft, 
        notes: `${commonAreaSqft} SF (approx. ${lightingQty} lights @ 1 per 100 SF)` 
      },
      { 
        scopeName: 'New General Duct Work and Distribution', 
        quantity: commonAreaSqft, 
        notes: `${commonAreaSqft} SF duct work distribution` 
      },
    ],
  };
}
