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
}

export const assemblies: Assembly[] = [
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
    id: 'single-restroom',
    name: 'Single Occupancy Restroom (8x8)',
    description: 'Complete ADA-compliant restroom with toilet, sink, accessories, and finishes',
    category: 'Single Occ Restroom',
    squareFeet: 64, // 8x8 restroom footprint
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
