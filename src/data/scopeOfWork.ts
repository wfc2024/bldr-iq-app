// Scope of work data from company CSV
export interface ScopeOfWork {
  name: string;
  unitType: string;
  defaultUnitCost: number;
  group: string;
  unitReasoning: string;
}

// Generate unit reasoning based on unit type
const getUnitReasoning = (unit: string): string => {
  const unitLower = unit.toLowerCase();
  
  if (unitLower === 'sqft' || unitLower === 'sf') {
    return 'This item is priced by square feet because material and labor costs scale with the area being covered. Calculate by multiplying length × width of the space.';
  } else if (unitLower === 'lf' || unitLower === 'linear feet') {
    return 'This item is priced by linear feet (straight line length) because costs scale with the length of the installation, not the area. Measure the total length needed.';
  } else if (unitLower === 'each' || unitLower === 'ea') {
    return 'This item is priced per unit (each) because every installation is a complete package with materials, labor, and connections. Simply count how many you need.';
  } else if (unitLower === 'lump sum' || unitLower === 'lumpsum') {
    return 'This is a lump sum (flat fee) covering all aspects of this work scope. The price is fixed regardless of minor variations in project size or complexity.';
  } else if (unitLower === 'months' || unitLower === 'month') {
    return 'This item is priced per month, typically used for time-based services like project management, supervision, or equipment rental over the duration of the project.';
  } else {
    return `This item is priced per ${unit}. Costs are calculated based on the quantity of ${unit} required for your project.`;
  }
};

// Scope of work data - maintaining exact order from CSV
export const scopeOfWorkData: ScopeOfWork[] = [
  { group: 'GCs', name: 'Scissor Lift', unitType: 'months', defaultUnitCost: 700, unitReasoning: getUnitReasoning('months') },
  { group: 'GCs', name: 'Telescoping Fork Lift (Gradeall)', unitType: 'months', defaultUnitCost: 1500, unitReasoning: getUnitReasoning('months') },
  { group: 'GCs', name: 'Plans, Permits, and Fees (Small Office/Retail/Restaurant Space) <2000 sqft', unitType: 'lump sum', defaultUnitCost: 5000, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'GCs', name: 'Plans, Permits, and Fees (Mid Size Office/Retail/Restaurant Space)  2001 - 3500 sqft', unitType: 'lump sum', defaultUnitCost: 10000, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'GCs', name: 'Plans, Permits, and Fees (Large Office/Retail/Restaurant Space) 3501 - 5000 sqft', unitType: 'lump sum', defaultUnitCost: 15000, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Demo', name: 'Demo Allowance (Small Office/Retail/Restaurant Space) <2000 sqft', unitType: 'lump sum', defaultUnitCost: 5000, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Demo', name: 'Demo Allowance (Mid Size Office/Retail/Restaurant Space) 2001 - 3500 sqft', unitType: 'lump sum', defaultUnitCost: 12500, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Demo', name: 'Demo Allowance (Large Office/Retail/Restaurant Space) 3501 - 5000 sqft', unitType: 'lump sum', defaultUnitCost: 20000, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Demo', name: 'Concrete Cutting - 2\' Trench (Cut/Remove/Dispose)', unitType: 'lf', defaultUnitCost: 24, unitReasoning: getUnitReasoning('lf') },
  { group: 'Demo', name: 'Concrete Cutting - Wall Saw (3\'0\'\'x7\'0\'\' Door Opening)', unitType: 'each', defaultUnitCost: 1000, unitReasoning: getUnitReasoning('each') },
  { group: 'Demo', name: 'Concrete Cutting - Wall Saw (Window)', unitType: 'each', defaultUnitCost: 750, unitReasoning: getUnitReasoning('each') },
  { group: 'Structural', name: 'RTU Supports (steel) Installed', unitType: 'each', defaultUnitCost: 2500, unitReasoning: getUnitReasoning('each') },
  { group: 'Structural', name: 'RTU Supports (wood) Installed)', unitType: 'each', defaultUnitCost: 1000, unitReasoning: getUnitReasoning('each') },
  { group: 'Concrete', name: 'Concrete Slab', unitType: 'sqft', defaultUnitCost: 12, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Concrete', name: 'Concrete Trench Patch Back  (Job Minimum)', unitType: 'lump sum', defaultUnitCost: 3000, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Concrete', name: 'Concrete Trench Patch Back (4\'\' slab)', unitType: 'lf', defaultUnitCost: 11, unitReasoning: getUnitReasoning('lf') },
  { group: 'Concrete', name: 'Concrete Trench Patch Back (6" slab)', unitType: 'lf', defaultUnitCost: 14, unitReasoning: getUnitReasoning('lf') },
  { group: 'Concrete', name: 'Sidewalk', unitType: 'sqft', defaultUnitCost: 18, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Wood / Carpentry', name: 'Blocking / Backing Allowance', unitType: 'lump sum', defaultUnitCost: 1500, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Wood / Carpentry', name: 'Finish Carpentry Allowance (Small Office/Retail/Restaurant Space) <2000 sqft', unitType: 'lump sum', defaultUnitCost: 5000, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Wood / Carpentry', name: 'Finish Carpentry Allowance (Mid Size Office/Retail/Restaurant Space) 2001 - 3500 sqft', unitType: 'lump sum', defaultUnitCost: 10000, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Wood / Carpentry', name: 'Finish Carpentry Allowance (Large Office/Retail/Restaurant Space) 3501 - 5000 sqft', unitType: 'lump sum', defaultUnitCost: 15000, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Thermal / Moisture', name: 'Sound Insulation', unitType: 'sqft', defaultUnitCost: 1, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Thermal / Moisture', name: 'Membrane Roof Patching (RTU)', unitType: 'each', defaultUnitCost: 500, unitReasoning: getUnitReasoning('each') },
  { group: 'Thermal / Moisture', name: 'Membrane Roof Patching (plumbing vent or similar penetration)', unitType: 'each', defaultUnitCost: 250, unitReasoning: getUnitReasoning('each') },
  { group: 'Thermal / Moisture', name: 'Flashing / General Sheetmetal Allowance', unitType: 'lump sum', defaultUnitCost: 5000, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Doors and Windows', name: 'Hollow Metal Frame + Hollow Metal Door + Hardware Installed', unitType: 'each', defaultUnitCost: 1800, unitReasoning: getUnitReasoning('each') },
  { group: 'Doors and Windows', name: 'Hollow Metal Frame  + Solid Core Wood Door + Hardware Installed', unitType: 'each', defaultUnitCost: 2000, unitReasoning: getUnitReasoning('each') },
  { group: 'Doors and Windows', name: 'Alluminum Storefront Windows', unitType: 'sqft', defaultUnitCost: 65, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Doors and Windows', name: 'Alluminum Storefront Doors 3\'0\'\' x 7\'0\'\' (standard hardware)', unitType: 'each', defaultUnitCost: 3000, unitReasoning: getUnitReasoning('each') },
  { group: 'Doors and Windows', name: 'Alluminum Storefront Doors 3\'0\'\' x 7\'0\'\' (specialty hardware)', unitType: 'each', defaultUnitCost: 4500, unitReasoning: getUnitReasoning('each') },
  { group: 'Doors and Windows', name: 'Alluminum Storefront Double Doors  6\'0\'\' x 7\'0\'\' (standard hardware)', unitType: 'each', defaultUnitCost: 6000, unitReasoning: getUnitReasoning('each') },
  { group: 'Doors and Windows', name: 'Alluminum Storefront Double Doors  6\'0\'\' x 7\'0\'\' (specialty hardware)', unitType: 'each', defaultUnitCost: 9000, unitReasoning: getUnitReasoning('each') },
  { group: 'Finishes', name: '8\' Metal Stud Wall + Sheetrock', unitType: 'lf', defaultUnitCost: 105, unitReasoning: getUnitReasoning('lf') },
  { group: 'Finishes', name: '10\' Metal Stud Wall + Sheetrock', unitType: 'lf', defaultUnitCost: 110, unitReasoning: getUnitReasoning('lf') },
  { group: 'Finishes', name: '12\' Metal Stud Wall + Sheetrock', unitType: 'lf', defaultUnitCost: 115, unitReasoning: getUnitReasoning('lf') },
  { group: 'Finishes', name: '14\' Metal Stud Wall + Sheetrock', unitType: 'lf', defaultUnitCost: 125, unitReasoning: getUnitReasoning('lf') },
  { group: 'Finishes', name: 'Accoustical Ceiling Grid and Tile', unitType: 'sqft', defaultUnitCost: 6.5, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Finishes', name: 'Accoustic Ceiling Tile Only', unitType: 'sqft', defaultUnitCost: 3, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Finishes', name: 'Wall Paper', unitType: 'sqft', defaultUnitCost: 8, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Finishes', name: 'FRP', unitType: 'sqft', defaultUnitCost: 4, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Finishes', name: 'Interior Paint (include total sqft of wall and ceiling being painted)', unitType: 'sqft', defaultUnitCost: 1.75, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Finishes', name: 'Exterior Paint', unitType: 'sqft', defaultUnitCost: 2.25, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Finishes', name: 'Floor Prep', unitType: 'sqft', defaultUnitCost: 3, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Finishes', name: 'Carpet Tile', unitType: 'sqft', defaultUnitCost: 6, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Finishes', name: 'LVT', unitType: 'sqft', defaultUnitCost: 8, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Finishes', name: 'Tile', unitType: 'sqft', defaultUnitCost: 30, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Finishes', name: 'Sealed Concrete', unitType: 'sqft', defaultUnitCost: 6, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Finishes', name: 'Rubber Base', unitType: 'lf', defaultUnitCost: 2, unitReasoning: getUnitReasoning('lf') },
  { group: 'Specialties', name: 'Bathroom Partitions (2 Restrooms: 3 stalls and 1 Urinal Screen)', unitType: 'each', defaultUnitCost: 7500, unitReasoning: getUnitReasoning('each') },
  { group: 'Specialties', name: 'Bathroom Accessories per RR', unitType: 'lump sum', defaultUnitCost: 750, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Specialties', name: 'Fire Exstinguishers', unitType: 'each', defaultUnitCost: 200, unitReasoning: getUnitReasoning('each') },
  { group: 'Fire Sprinklers', name: 'Relocate Exisitng Heads', unitType: 'each', defaultUnitCost: 350, unitReasoning: getUnitReasoning('each') },
  { group: 'Fire Sprinklers', name: 'Sprinkler Design and Permit (require if any heads to be relocated)', unitType: 'lump sum', defaultUnitCost: 1500, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Plumbing', name: 'New plumbing fixtures including necessary underground and overhead work', unitType: 'each', defaultUnitCost: 3500, unitReasoning: getUnitReasoning('each') },
  { group: 'Mechanical', name: 'Relocated Grills / Registers / Diffusers (keep existing duct work)', unitType: 'each', defaultUnitCost: 250, unitReasoning: getUnitReasoning('each') },
  { group: 'Mechanical', name: 'New General Duct Work and Distribution', unitType: 'sqft', defaultUnitCost: 8, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Mechanical', name: 'New RTU', unitType: 'each', defaultUnitCost: 10000, unitReasoning: getUnitReasoning('each') },
  { group: 'Mechanical', name: 'New Type 1 Hood 10 lf or less', unitType: 'each', defaultUnitCost: 65000, unitReasoning: getUnitReasoning('each') },
  { group: 'Electrical', name: 'General Electrical Distribution for Tenant Improvement', unitType: 'sqft', defaultUnitCost: 18, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Electrical', name: 'Lighting Allowance for Tentant Improvement', unitType: 'sqft', defaultUnitCost: 3, unitReasoning: getUnitReasoning('sqft') },
  { group: 'Electrical', name: 'Light Fixture Swap 1 for 1', unitType: 'each', defaultUnitCost: 300, unitReasoning: getUnitReasoning('each') },
  { group: 'Electrical', name: 'Electrical Gear Allowance (panel and breakers)', unitType: 'each', defaultUnitCost: 5000, unitReasoning: getUnitReasoning('each') },
  { group: 'Electrical', name: 'Low Voltage Allowance space under 2500 sqft', unitType: 'lump sum', defaultUnitCost: 5000, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Electrical', name: 'Low Voltage Allowance space 2500 - 5000 sqft', unitType: 'lump sum', defaultUnitCost: 7500, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Electrical', name: 'Low Voltage Allowance space over 5000 sqft', unitType: 'lump sum', defaultUnitCost: 10000, unitReasoning: getUnitReasoning('lump sum') },
  { group: 'Electrical', name: 'Fire Alarm Allowance', unitType: 'lump sum', defaultUnitCost: 10000, unitReasoning: getUnitReasoning('lump sum') },
];

// Extract unique groups from data in the order they appear (not alphabetically)
export const categories: string[] = [];
scopeOfWorkData.forEach(item => {
  if (!categories.includes(item.group)) {
    categories.push(item.group);
  }
});
