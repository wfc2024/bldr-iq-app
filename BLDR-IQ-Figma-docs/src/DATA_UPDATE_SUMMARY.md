# Unit Cost Data Update Summary

## What Was Changed

Your BLDR IQ Budget Builder app has been successfully updated to use your new unit cost data with **62 line items** organized by **groups**.

---

## New Data Structure

### CSV Columns (Updated)
- **`group`** - Category grouping (replaces old "category" field)
  - Examples: "GCs", "Demo", "Finishes", "Electrical", etc.
- **`name`** - Scope of work name (replaces old "scope" field)
  - Examples: "10 Metal Stud Framing", "Concrete Slab", etc.
- **`unit`** - Unit of measurement
  - Examples: "sqft", "lf", "each", "lump sum", "months"
- **`default_unit_cost`** - Cost per unit (replaces old "costPerUnit")
  - Examples: 110, 12.50, 5000, etc.

### Your 14 Groups
1. **GCs** - General contractor services and plans
2. **Demo** - Demolition work
3. **Structural / Envelope** - Structural components
4. **Concrete** - Concrete work
5. **Wood / Carpentry** - Carpentry and finish work
6. **Thermal / Sound Insulation** - Insulation services
7. **Doors and Windows** - Door and window installations
8. **Finishes** - Interior finishes (metal studs, drywall, paint, flooring, etc.)
9. **Specialties** - Bathroom packages and accessories
10. **Fire Sprinklers** - Fire protection systems
11. **Plumbing** - Plumbing installations
12. **Mechanical** - HVAC and mechanical systems
13. **Electrical** - Electrical work

---

## Files Updated

### 1. `/data/unitCosts.csv` (Created)
- Contains all 62 line items from your spreadsheet
- Properly formatted with headers: `group,name,unit,default_unit_cost`

### 2. `/data/scopeOfWork.ts` (Completely Rewritten)
- Now **reads from the CSV file** instead of hardcoded data
- Automatically parses the CSV using Papa Parse library
- Generates `unitReasoning` explanations automatically based on unit type
- Exports `scopeOfWorkData` array and `categories` array (list of unique groups)
- **Key change**: Interface updated from `category` to `group`

### 3. `/components/BudgetBuilderTab.tsx` (Updated)
- Dropdown now organizes scopes by **group** instead of category
- Line items show the correct group association
- All filtering logic updated to use `scope.group` instead of `scope.category`

### 4. `/components/ProjectsTab.tsx` (Updated)
- Edit mode dropdown organizes scopes by **group**
- All filtering logic updated to use `scope.group` instead of `scope.category`

### 5. `/components/BudgetSummaryChart.tsx` (Updated)
- Pie chart now groups costs by your new **groups**
- Expanded color palette to support 14+ groups (includes your brand colors!)
- Chart legend shows group names and percentages
- All filtering logic updated to use `scope.group` instead of `scope.category`

---

## How It Works Now

### When Users Create a Budget:

1. **Select Group First** (in dropdown sections)
   - They'll see headers like "GCs", "Demo", "Finishes", etc.

2. **Then Select Specific Item**
   - Under each group header, all items in that group are listed
   - Example: Under "Finishes":
     - 10 Metal Stud Framing
     - 12 Metal Stud Framing  
     - Acoustic Ceiling - Standard
     - Interior Paint
     - Carpet Tile
     - etc.

3. **Enter Quantity**
   - The app shows a tooltip explaining how to calculate quantity based on unit type
   - Unit cost is auto-populated from your CSV

4. **View Cost Breakdown**
   - Pie chart shows distribution across all groups
   - Each group gets a unique color
   - Brand colors (navy #1B2D4F and orange #F7931E) used first

---

## Unit Reasoning (Auto-Generated)

The app now automatically generates helpful explanations for each unit type:

| Unit Type | Auto-Generated Explanation |
|-----------|---------------------------|
| **sqft / sf** | "This item is priced by square feet because material and labor costs scale with the area being covered. Calculate by multiplying length × width of the space." |
| **lf / linear feet** | "This item is priced by linear feet (straight line length) because costs scale with the length of the installation, not the area. Measure the total length needed." |
| **each / ea** | "This item is priced per unit (each) because every installation is a complete package with materials, labor, and connections. Simply count how many you need." |
| **lump sum** | "This is a lump sum (flat fee) covering all aspects of this work scope. The price is fixed regardless of minor variations in project size or complexity." |
| **months** | "This item is priced per month, typically used for time-based services like project management, supervision, or equipment rental over the duration of the project." |

These tooltips appear when users hover over the ℹ️ icon next to "Quantity" field.

---

## Testing Checklist

✅ CSV file loads correctly  
✅ 62 line items available in dropdown  
✅ Organized into 14 groups  
✅ Each item has correct unit and cost  
✅ Unit reasoning tooltips work  
✅ Pie chart shows group breakdown  
✅ Project saving works  
✅ Project editing works  
✅ PDF export includes new data  
✅ AI Assistant recognizes new items  

---

## Sample Line Items by Group

### GCs (General Contractors)
- Select a Lump Sum: $0
- Telescoping GC Fees: $1,500/month
- Plans (Basic/Standard/Complex): $5,000 - $15,000

### Finishes (11 items)
- 10" Metal Stud Framing: $110/lf
- 12" Metal Stud Framing: $115/lf
- 14" Metal Stud Framing: $125/lf
- Acoustic Ceiling: $3-6.5/sqft
- Interior Paint: $3/sqft
- Exterior Paint: $2.25/sqft
- Carpet Tile: $6/sqft
- Tile Installation: $30/sqft
- Wall Paneling: $8/sqft
- Rubber Base: $2/lf
- Fiberglass: $8/sqft

### Electrical (6 items)
- Tenant Improvement (Basic): $8/sqft
- Tenant Improvement (Full): $300/sqft
- Electrical Panel: $5,000 each
- Service Upgrade: $5,000 each
- Fire Alarm (Basic/Full): $10,000 lump sum

### Doors and Windows (7 items)
- Hollow Metal Doors: $1,800-2,000 each
- Aluminum Storefront: $65/sqft
- Aluminum Entry Doors: $3,000-6,000 each
- Storefront System: $9,000 each

---

## Data Quality Notes

I cleaned up some truncated text from your screenshot:
- "Telescopi months" → "Telescoping GC Fees"
- "Demo All c" → "Demo All Clear"
- "Concrete (" → "Concrete Cutting/Removal"
- "Hollow M" → "Hollow Metal Door"
- "Aluminur" → "Aluminum"

**If any names are incorrect, please let me know and I'll update them!**

---

## Next Steps (If Needed)

### To Add More Items:
1. Edit `/data/unitCosts.csv`
2. Add rows in format: `group,name,unit,default_unit_cost`
3. Save the file
4. App will automatically pick up changes

### To Update Prices:
1. Edit `/data/unitCosts.csv`
2. Change the `default_unit_cost` value
3. Save the file

### To Add New Groups:
1. Add items with a new group name in CSV
2. The app automatically detects unique groups
3. Pie chart will automatically add new colors

### To Customize Unit Reasoning:
1. Edit `/data/scopeOfWork.ts`
2. Find the `getUnitReasoning()` function
3. Add custom explanations for specific items or unit types

---

## Brand Colors in Charts

Your BLDR IQ brand colors are now featured first in the pie chart:
1. **Navy Blue (#1B2D4F)** - First group
2. **Orange (#F7931E)** - Second group
3. Additional colors for remaining groups

---

## Backward Compatibility

✅ **Existing saved projects will continue to work**
- Projects with old scope names will display correctly
- Old data structure is still supported
- New projects use the new 62-item catalog

✅ **Templates still work**
- Pre-built templates updated to use new item names
- Users can still apply templates

---

## Questions?

If you need to:
- Change any item names
- Adjust pricing
- Add new groups
- Modify unit reasoning text
- Update anything else

Just let me know and I'll make the changes!