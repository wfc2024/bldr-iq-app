// Pre-configured assemblies (packages) that GCs commonly need together
export interface AssemblyItem {
  scopeName: string;
  quantity: number;
  notes?: string;
}

export interface Assembly {
  id: string;
  name: string;
  description: string;
  category: string;
  items: AssemblyItem[];
}

export const assemblies: Assembly[] = [
  {
    id: 'small-office-package',
    name: 'Small Office Build-Out Package',
    description: 'Complete package for <2000 sqft office space',
    category: 'Office',
    items: [
      { scopeName: 'Plans, Permits, and Fees (Small Office/Retail/Restaurant Space) <2000 sqft', quantity: 1 },
      { scopeName: 'Demo Allowance (Small Office/Retail/Restaurant Space) <2000 sqft', quantity: 1 },
      { scopeName: 'Blocking / Backing Allowance', quantity: 1 },
      { scopeName: 'Finish Carpentry Allowance (Small Office/Retail/Restaurant Space) <2000 sqft', quantity: 1 },
      { scopeName: 'Sprinkler Design and Permit (require if any heads to be relocated)', quantity: 1 },
      { scopeName: 'Low Voltage Allowance', quantity: 1 },
    ],
  },
  {
    id: 'mid-office-package',
    name: 'Mid-Size Office Build-Out Package',
    description: 'Complete package for 2001-3500 sqft office space',
    category: 'Office',
    items: [
      { scopeName: 'Plans, Permits, and Fees (Mid Size Office/Retail/Restaurant Space)  2001 - 3500 sqft', quantity: 1 },
      { scopeName: 'Demo Allowance (Mid Size Office/Retail/Restaurant Space) 2001 - 3500 sqft', quantity: 1 },
      { scopeName: 'Blocking / Backing Allowance', quantity: 1 },
      { scopeName: 'Finish Carpentry Allowance (Mid Size Office/Retail/Restaurant Space) 2001 - 3500 sqft', quantity: 1 },
      { scopeName: 'Sprinkler Design and Permit (require if any heads to be relocated)', quantity: 1 },
      { scopeName: 'Low Voltage Allowance', quantity: 1 },
    ],
  },
  {
    id: 'large-office-package',
    name: 'Large Office Build-Out Package',
    description: 'Complete package for 3501-5000 sqft office space',
    category: 'Office',
    items: [
      { scopeName: 'Plans, Permits, and Fees (Large Office/Retail/Restaurant Space) 3501 - 5000 sqft', quantity: 1 },
      { scopeName: 'Demo Allowance (Large Office/Retail/Restaurant Space) 3501 - 5000 sqft', quantity: 1 },
      { scopeName: 'Blocking / Backing Allowance', quantity: 1 },
      { scopeName: 'Finish Carpentry Allowance (Large Office/Retail/Restaurant Space) 3501 - 5000 sqft', quantity: 1 },
      { scopeName: 'Sprinkler Design and Permit (require if any heads to be relocated)', quantity: 1 },
      { scopeName: 'Low Voltage Allowance', quantity: 1 },
      { scopeName: 'Fire Alarm Allowance', quantity: 1 },
    ],
  },
  {
    id: 'bathroom-package',
    name: 'Standard Bathroom Package',
    description: '2 Restrooms with fixtures and finishes',
    category: 'Plumbing',
    items: [
      { scopeName: 'Bathroom Partitions (2 Restrooms: 3 stalls and 1 Urinal Screen)', quantity: 1 },
      { scopeName: 'Bathroom Accessories per RR', quantity: 2 },
      { scopeName: 'Tenant Improvement (new fixtures including necessary underground and overhead work)', quantity: 6, notes: '2 toilets, 2 sinks, 1 urinal, 1 mop sink' },
    ],
  },
  {
    id: 'hvac-rtu-package',
    name: 'New HVAC RTU Package',
    description: 'Complete new rooftop unit with supports and distribution',
    category: 'Mechanical',
    items: [
      { scopeName: 'New RTU', quantity: 1 },
      { scopeName: 'RTU Supports (steel) Installed', quantity: 1 },
      { scopeName: 'Membrane Roof Patching (RTU)', quantity: 1 },
    ],
  },
  {
    id: 'door-opening-package',
    name: 'New Door Opening Package',
    description: 'Cut new door opening in concrete wall',
    category: 'Demo',
    items: [
      { scopeName: 'Concrete Cutting - Wall Saw (3\'0\'\'x7\'0\'\' Door Opening)', quantity: 1 },
      { scopeName: 'Hollow Metal Frame + Hollow Metal Door + Hardware Installed', quantity: 1 },
    ],
  },
  {
    id: 'storefront-entry-package',
    name: 'Storefront Entry Package',
    description: 'Single glass door with sidelights',
    category: 'Doors and Windows',
    items: [
      { scopeName: 'Alluminum Storefront Doors 3\'0\'\' x 7\'0\'\' (standard hardware)', quantity: 1 },
      { scopeName: 'Alluminum Storefront Windows', quantity: 40, notes: 'Approximate sqft for sidelights' },
    ],
  },
  {
    id: 'electrical-ti-package',
    name: 'Electrical TI Package',
    description: 'Basic electrical distribution and lighting per 1000 sqft',
    category: 'Electrical',
    items: [
      { scopeName: 'Tenant Improvement General Electrical Distribution', quantity: 1000, notes: 'Adjust quantity to match sqft' },
      { scopeName: 'Tentant Improvement Lighting Allowance', quantity: 1000, notes: 'Adjust quantity to match sqft' },
      { scopeName: 'Electrical Gear Allowance (panel and breakers)', quantity: 1 },
    ],
  },
  {
    id: 'paint-package-1000',
    name: 'Paint Package (1000 SF)',
    description: 'Interior paint for walls and ceiling - 1000 sqft space',
    category: 'Finishes',
    items: [
      { scopeName: 'Interior Paint (include total sqft of wall and ceiling being painted)', quantity: 2800, notes: 'Estimated wall + ceiling area for 1000 SF space' },
    ],
  },
  {
    id: 'flooring-package-office',
    name: 'Office Flooring Package (per 1000 SF)',
    description: 'Carpet tile with prep and base',
    category: 'Finishes',
    items: [
      { scopeName: 'Floor Prep', quantity: 1000, notes: 'Adjust to match sqft' },
      { scopeName: 'Carpet Tile', quantity: 1000, notes: 'Adjust to match sqft' },
      { scopeName: 'Rubber Base', quantity: 320, notes: 'Approximate perimeter for 1000 SF' },
    ],
  },
  {
    id: 'ceiling-package',
    name: 'Acoustic Ceiling Package (per 1000 SF)',
    description: 'Grid and tile for suspended ceiling',
    category: 'Finishes',
    items: [
      { scopeName: 'Accoustical Ceiling Grid and Tile', quantity: 1000, notes: 'Adjust to match sqft' },
    ],
  },
  {
    id: 'equipment-rental-package',
    name: 'Standard Equipment Rental (3 months)',
    description: 'Scissor lift for 3-month project',
    category: 'GCs',
    items: [
      { scopeName: 'Scissor Lift', quantity: 3, notes: 'Adjust months to match project duration' },
    ],
  },
];

// Extract unique categories from assemblies
export const assemblyCategories = Array.from(new Set(assemblies.map(a => a.category)));
