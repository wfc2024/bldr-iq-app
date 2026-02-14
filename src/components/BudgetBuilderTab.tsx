import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Trash2, Plus, AlertCircle, Copy, FileDown, Package, ArrowLeft } from "lucide-react";
import { scopeOfWorkData, categories } from "../data/scopeOfWork";
import { LineItem, Project } from "../types/project";
import { toast } from "sonner@2.0.3";
import { HelpTooltip } from "./HelpTooltip";
import { TemplateSelector } from "./TemplateSelector";
import { BudgetSummaryChart } from "./BudgetSummaryChart";
import { AssemblySelector } from "./AssemblySelector";
import { QuantityCalculator } from "./QuantityCalculator";
import { helpText, benchmarkData, ProjectTemplate } from "../data/helpText";
import { dataService } from "../services/dataService";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";
import { calculateCategoryBreakdown } from "../utils/categoryBreakdown";
import { downloadPDF } from "../utils/pdfExport";
import { Assembly, createCommonAreaAssembly, assemblies } from "../data/assemblies";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

interface BudgetBuilderTabProps {
  onProjectSaved: () => void;
  resetForTutorial?: boolean;
  autoStartFromScratch?: boolean;
}

export function BudgetBuilderTab({ onProjectSaved, resetForTutorial, autoStartFromScratch }: BudgetBuilderTabProps) {
  const { user } = useAuth();
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [address, setAddress] = useState("");
  const [gcCompanyName, setGcCompanyName] = useState("");
  const [gcMarkup, setGcMarkup] = useState("");
  const [generalConditions, setGeneralConditions] = useState("");
  const [status, setStatus] = useState<"Draft" | "Active" | "Completed" | "Archived">("Draft");
  const [projectNotes, setProjectNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [totalSqft, setTotalSqft] = useState("");
  const [showNotIncluded, setShowNotIncluded] = useState(false);
  const [scopeGapBuffer, setScopeGapBuffer] = useState<number>(10); // Default 10%
  const [templateType, setTemplateType] = useState<string>(""); // Track which template was used
  
  // Use a ref to track the last calculated common area sqft (prevents infinite loop)
  const lastCommonAreaSqft = useRef<number | null>(null);
  
  // Track the serialized state of assemblies to detect real changes
  const lastAssembliesState = useRef<string>('');
  
  // Track the last state of assembly multipliers to prevent infinite loops
  const lastMultiplierState = useRef<string>('');

  // Dynamically recalculate assemblies with conditional baseline multipliers
  useEffect(() => {
    console.log('🔄 Assembly multiplier useEffect triggered');
    
    // Get all assembly line items with conditional baseline multipliers
    const conditionalAssemblies = lineItems.filter(item => 
      item.isAssembly && 
      !item.isDynamicCommonArea &&
      // Check if the original assembly definition has conditional multiplier
      assemblies.find(a => a.name === item.assemblyName)?.hasConditionalBaselineMultiplier
    );
    
    if (conditionalAssemblies.length === 0) {
      console.log('❌ No conditional assemblies found');
      lastMultiplierState.current = '';
      return;
    }
    
    // Count unique assembly types (excluding common area)
    const assemblyTypes = new Set(
      lineItems
        .filter(item => item.isAssembly && !item.isDynamicCommonArea)
        .map(item => item.assemblyName)
    );
    
    const assemblyTypeCount = assemblyTypes.size;
    console.log(`📊 Assembly types count: ${assemblyTypeCount}, Types: ${Array.from(assemblyTypes).join(', ')}`);
    
    // Create a snapshot of the current state
    const currentState = `${Array.from(assemblyTypes).sort().join('|')}:${conditionalAssemblies.map(a => a.id).join(',')}`;
    
    if (currentState === lastMultiplierState.current) {
      console.log('⏭️ Skipping - multiplier state unchanged');
      return;
    }
    
    console.log('🆕 Multiplier state changed, recalculating...');
    lastMultiplierState.current = currentState;
    
    // Update each conditional assembly
    setLineItems(prev => {
      return prev.map(item => {
        // Only process assemblies with conditional baseline multipliers
        const assemblyDef = assemblies.find(a => a.name === item.assemblyName);
        if (!item.isAssembly || item.isDynamicCommonArea || !assemblyDef?.hasConditionalBaselineMultiplier) {
          return item;
        }
        
        // Recalculate base cost from assembly definition
        let assemblyUnitCost = 0;
        assemblyDef.items.forEach(assemblyItem => {
          const scope = scopeOfWorkData.find(s => s.name === assemblyItem.scopeName);
          if (scope) {
            assemblyUnitCost += assemblyItem.quantity * scope.defaultUnitCost;
          }
        });
        
        // Determine if multiplier should apply
        let discountPercent = 0;
        if (assemblyDef.scaleDiscounts && assemblyDef.scaleDiscounts.length > 0) {
          const tier = assemblyDef.scaleDiscounts.find(
            discount => item.quantity >= discount.minQty && item.quantity <= discount.maxQty
          );
          
          if (tier && tier.discountPercent < 0) {
            const baselineMultiplier = tier.discountPercent; // e.g., -20 for 1.2x
            
            // Apply tiered multiplier based on number of assembly types
            if (assemblyTypeCount === 1) {
              // Single assembly type: Full multiplier
              discountPercent = baselineMultiplier;
              console.log(`  🔧 ${item.assemblyName}: Full multiplier ${discountPercent}% (1 assembly type)`);
            } else if (assemblyTypeCount === 2) {
              // Two assembly types: Half multiplier
              discountPercent = baselineMultiplier / 2;
              console.log(`  🔧 ${item.assemblyName}: Half multiplier ${discountPercent}% (2 assembly types)`);
            } else {
              // Three or more assembly types: No multiplier
              discountPercent = 0;
              console.log(`  🔧 ${item.assemblyName}: No multiplier (${assemblyTypeCount} assembly types)`);
            }
          }
        }
        
        // Apply discount/multiplier
        const discountMultiplier = 1 - (discountPercent / 100);
        const finalUnitCost = assemblyUnitCost * discountMultiplier;
        const newTotal = item.quantity * finalUnitCost;
        
        // Only update if the cost actually changed
        if (Math.abs(item.unitCost - finalUnitCost) > 0.01 || Math.abs(item.total - newTotal) > 0.01) {
          console.log(`  ✅ Updated ${item.assemblyName}: $${item.unitCost.toFixed(2)} → $${finalUnitCost.toFixed(2)}`);
          return {
            ...item,
            unitCost: finalUnitCost,
            total: newTotal,
          };
        }
        
        return item;
      });
    });
    
  }, [lineItems]); // Re-run when line items change

  // Automatically update dynamic common area assembly when line items or total sqft changes
  useEffect(() => {
    console.log('🔄 Common area useEffect triggered, lineItems count:', lineItems.length);
    console.log('📋 All line items:', lineItems.map(item => ({
      id: item.id.substring(0, 8),
      name: item.scopeName,
      isAssembly: item.isAssembly,
      isDynamicCommonArea: item.isDynamicCommonArea,
      assemblySqft: item.assemblySqft,
      quantity: item.quantity
    })));
    
    // Find if there's a dynamic common area line item
    const commonAreaItem = lineItems.find(item => item.isDynamicCommonArea);
    if (!commonAreaItem) {
      console.log('❌ No common area found');
      lastCommonAreaSqft.current = null;
      lastAssembliesState.current = '';
      return; // No common area to update
    }
    
    console.log('✅ Found common area:', commonAreaItem.scopeName);

    const projectSqft = parseFloat(totalSqft) || 0;
    if (projectSqft === 0) {
      console.log('❌ No total sqft set');
      return; // Can't calculate without total sqft
    }

    // Create a snapshot of assembly state (excluding common area itself)
    const assembliesSnapshot = lineItems
      .filter(item => item.isAssembly && !item.isDynamicCommonArea)
      .map(item => `${item.id}:${item.assemblySqft}:${item.quantity}`)
      .sort()
      .join('|');
    
    console.log('📸 Assemblies snapshot:', assembliesSnapshot);
    console.log('📸 Last snapshot:', lastAssembliesState.current);
    
    // If assemblies haven't changed, skip update
    if (assembliesSnapshot === lastAssembliesState.current && lastCommonAreaSqft.current !== null) {
      console.log('⏭️ Skipping update - assemblies unchanged');
      return;
    }
    
    console.log('🆕 Assemblies changed! Proceeding with update...');

    // Calculate current common area sqft based on other assemblies
    let usedSqft = 0;
    lineItems.forEach(item => {
      if (item.isAssembly && !item.isDynamicCommonArea && item.assemblySqft) {
        const itemUsage = item.assemblySqft * item.quantity;
        console.log(`  📦 ${item.scopeName}: ${item.assemblySqft} sqft × ${item.quantity} = ${itemUsage} sqft`);
        usedSqft += itemUsage;
      } else if (item.isAssembly && !item.isDynamicCommonArea && !item.assemblySqft) {
        console.log(`  ⚠️ ${item.scopeName}: No assemblySqft property!`);
      }
    });

    const newCommonAreaSqft = Math.max(0, Math.round(projectSqft - usedSqft));
    console.log(`📊 Total: ${projectSqft} sqft, Used: ${usedSqft} sqft, Common Area: ${newCommonAreaSqft} sqft`);
    console.log(`📌 Last calculated: ${lastCommonAreaSqft.current}, New calculation: ${newCommonAreaSqft}`);

    // Update the ref to track this calculation
    lastCommonAreaSqft.current = newCommonAreaSqft;
    lastAssembliesState.current = assembliesSnapshot;
    console.log('✅ Updating common area to', newCommonAreaSqft, 'sqft');

    // If the new square footage is 0 or negative, remove the common area instead of updating
    if (newCommonAreaSqft <= 0) {
      console.log('🗑️ Removing common area (0 or negative sqft)');
      setLineItems(prev => prev.filter(item => !item.isDynamicCommonArea));
      lastCommonAreaSqft.current = null;
      return;
    }

    // Regenerate the common area assembly with new sqft
    try {
      const updatedAssembly = createCommonAreaAssembly(newCommonAreaSqft);

      // Recalculate costs
      let assemblyUnitCost = 0;
      updatedAssembly.items.forEach(assemblyItem => {
        const scope = scopeOfWorkData.find(s => s.name === assemblyItem.scopeName);
        if (scope) {
          assemblyUnitCost += assemblyItem.quantity * scope.defaultUnitCost;
        }
      });

      // Create detailed notes
      const itemsList = updatedAssembly.items
        .map(item => `• ${item.scopeName} (${item.quantity} ${scopeOfWorkData.find(s => s.name === item.scopeName)?.unitType || 'units'})`)
        .join('\n');
      const detailedNotes = `${updatedAssembly.description}\n\nIncludes:\n${itemsList}`;

      // Update the line item (use functional update to avoid stale closure)
      setLineItems(prev => {
        // Double-check the common area still exists before updating
        const stillHasCommonArea = prev.some(item => item.isDynamicCommonArea);
        if (!stillHasCommonArea) {
          console.log('⚠️ Common area disappeared during update');
          return prev;
        }
        
        const updated = prev.map(item => {
          if (item.isDynamicCommonArea) {
            console.log('💾 Updating common area line item');
            return {
              ...item,
              scopeName: updatedAssembly.name,
              unitCost: assemblyUnitCost,
              total: assemblyUnitCost,
              notes: detailedNotes,
              assemblySqft: updatedAssembly.squareFeet, // Update the stored sqft
            };
          }
          return item;
        });
        
        return updated;
      });
    } catch (error) {
      console.error('Error updating common area:', error);
    }

  }, [lineItems, totalSqft]); // Re-run when line items or total sqft changes

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setProjectName(template.name);
    setGcMarkup(template.defaultGCMarkup.toString());
    setGeneralConditions("8");
    
    // Convert template line items to actual LineItems with scope data
    const templateLineItems: LineItem[] = template.lineItems.map(item => {
      const scope = scopeOfWorkData.find(s => s.name === item.scopeName);
      if (!scope) return null;
      
      const total = item.quantity * scope.defaultUnitCost;
      return {
        id: crypto.randomUUID(),
        scopeName: item.scopeName,
        unitType: scope.unitType,
        quantity: item.quantity,
        unitCost: scope.defaultUnitCost,
        total,
        notes: item.notes,
      };
    }).filter(Boolean) as LineItem[];
    
    setLineItems(templateLineItems);
    setShowTemplateSelector(false);
    setTemplateType(template.name);
    
    toast.success("Template loaded! Customize it to fit your needs.");
  };

  const handleStartFromScratch = () => {
    setShowTemplateSelector(false);
  };

  const handleBackToTemplates = () => {
    setShowTemplateSelector(true);
    toast.info('Returned to template selection');
  };

  const handleSelectAssembly = (assembly: Assembly, quantity: number = 1) => {
    // Calculate the total unit cost of the assembly by summing all components
    let assemblyUnitCost = 0;
    
    assembly.items.forEach(assemblyItem => {
      const scope = scopeOfWorkData.find(s => s.name === assemblyItem.scopeName);
      if (scope) {
        assemblyUnitCost += assemblyItem.quantity * scope.defaultUnitCost;
      }
    });

    // Count existing assembly types (excluding common area)
    const existingAssemblyTypes = new Set(
      lineItems
        .filter(item => item.isAssembly && !item.isDynamicCommonArea)
        .map(item => item.assemblyName)
    );
    
    // Calculate how many types there will be after adding this assembly
    let futureAssemblyTypeCount = existingAssemblyTypes.size;
    if (!existingAssemblyTypes.has(assembly.name) && !assembly.id.includes('common-area')) {
      futureAssemblyTypeCount += 1; // This will be a new type
    }

    // Calculate discount if applicable
    let discountPercent = 0;
    if (assembly.scaleDiscounts && assembly.scaleDiscounts.length > 0) {
      const tier = assembly.scaleDiscounts.find(
        discount => quantity >= discount.minQty && quantity <= discount.maxQty
      );
      
      if (tier && tier.discountPercent < 0 && assembly.hasConditionalBaselineMultiplier) {
        const baselineMultiplier = tier.discountPercent; // e.g., -20 for 1.2x
        
        // Apply tiered multiplier based on number of assembly types (including this new one)
        if (futureAssemblyTypeCount === 1) {
          // Single assembly type: Full multiplier
          discountPercent = baselineMultiplier;
        } else if (futureAssemblyTypeCount === 2) {
          // Two assembly types: Half multiplier
          discountPercent = baselineMultiplier / 2;
        } else {
          // Three or more assembly types: No multiplier
          discountPercent = 0;
        }
      } else if (tier && !assembly.hasConditionalBaselineMultiplier) {
        // For assemblies without conditional multipliers, apply the discount normally
        discountPercent = tier.discountPercent;
      }
    }

    // Apply discount to the total assembly unit cost
    const discountMultiplier = 1 - (discountPercent / 100);
    const finalUnitCost = assemblyUnitCost * discountMultiplier;
    const total = quantity * finalUnitCost;

    // Create detailed notes listing all included items
    const itemsList = assembly.items
      .map(item => `• ${item.scopeName} (${item.quantity} ${scopeOfWorkData.find(s => s.name === item.scopeName)?.unitType || 'units'})`)
      .join('\n');
    const detailedNotes = `${assembly.description}\n\nIncludes:\n${itemsList}`;

    // Check if this is a dynamic common area assembly
    const isDynamicCommonArea = assembly.id === 'common-area-dynamic';

    // Create a single line item for the assembly
    const assemblyLineItem: LineItem = {
      id: crypto.randomUUID(),
      scopeName: assembly.name,
      unitType: 'each',
      quantity: quantity,
      unitCost: finalUnitCost,
      total: total,
      notes: detailedNotes,
      isAssembly: true, // Flag to identify assembly line items
      assemblyName: assembly.name, // Track assembly name for cost breakdown
      assemblyCategory: assembly.category, // Track category for pie chart grouping
      isDynamicCommonArea: isDynamicCommonArea, // Flag for auto-updating common area
      assemblySqft: assembly.squareFeet, // Store the assembly footprint for calculations
    };

    // Insert at the top of the line items list
    setLineItems(prev => [assemblyLineItem, ...prev]);
    
    const discountMessage = discountPercent > 0 
      ? ` with ${discountPercent}% volume discount` 
      : '';
    toast.success(`Added ${quantity}x ${assembly.name}${discountMessage}`);
  };

  const handleDuplicateLineItem = (item: LineItem) => {
    const duplicatedItem: LineItem = {
      ...item,
      id: crypto.randomUUID(),
      notes: item.notes ? `${item.notes} (Copy)` : '(Copy)',
    };
    setLineItems(prev => [...prev, duplicatedItem]);
    toast.success('Line item duplicated');
  };

  const handleExportPDF = () => {
    if (!projectName || !address || lineItems.length === 0) {
      toast.error('Please complete project details and add line items before exporting');
      return;
    }

    const project: Project = {
      id: crypto.randomUUID(),
      projectName,
      address,
      gcCompanyName: gcCompanyName || undefined,
      gcMarkupPercentage: parseFloat(gcMarkup) || 0,
      generalConditionsPercentage: parseFloat(generalConditions) || 0,
      lineItems,
      subtotal: calculateSubtotal(),
      grandTotal: calculateGrandTotal(),
      status,
      notes: projectNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      downloadPDF(project, true);
      toast.success('PDF preview opened in new window');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please allow pop-ups for this site.');
    }
  };

  const addLineItem = () => {
    const newLineItem: LineItem = {
      id: crypto.randomUUID(),
      scopeName: "",
      unitType: "",
      quantity: 0,
      unitCost: 0,
      total: 0,
      notes: "",
    };
    setLineItems([...lineItems, newLineItem]);
  };

  const insertLineItemAt = (index: number) => {
    const newLineItem: LineItem = {
      id: crypto.randomUUID(),
      scopeName: "",
      unitType: "",
      quantity: 0,
      unitCost: 0,
      total: 0,
      notes: "",
    };
    const newItems = [...lineItems];
    newItems.splice(index, 0, newLineItem);
    setLineItems(newItems);
    toast.success('Line item inserted');
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItemScope = (id: string, scopeName: string) => {
    // Handle "Custom Input" selection
    if (scopeName === "CUSTOM_INPUT") {
      setLineItems(lineItems.map(item => {
        if (item.id === id) {
          return {
            ...item,
            scopeName: "CUSTOM_INPUT",
            unitType: "LS",
            quantity: 1,
            unitCost: 0,
            total: 0,
            isCustom: true,
            customScopeName: "",
          };
        }
        return item;
      }));
      return;
    }

    const scope = scopeOfWorkData.find(s => s.name === scopeName);
    if (!scope) return;

    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const total = item.quantity * scope.defaultUnitCost;
        return {
          ...item,
          scopeName,
          unitType: scope.unitType,
          unitCost: scope.defaultUnitCost,
          total,
          isCustom: false,
          customScopeName: undefined,
        };
      }
      return item;
    }));
  };

  const updateLineItemQuantity = (id: string, quantity: number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const total = quantity * item.unitCost;
        return {
          ...item,
          quantity,
          total,
        };
      }
      return item;
    }));
  };

  const updateLineItemNotes = (id: string, notes: string) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        return { ...item, notes };
      }
      return item;
    }));
  };

  const updateCustomScopeName = (id: string, customScopeName: string) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id && item.isCustom) {
        return { ...item, customScopeName };
      }
      return item;
    }));
  };

  const updateCustomUnitCost = (id: string, unitCost: number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id && item.isCustom) {
        const total = item.quantity * unitCost;
        return { ...item, unitCost, total };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateScopeGapBuffer = () => {
    // Only apply for Conceptual template
    if (templateType !== "Conceptual BLD w/ Pre-Packaged Assemblies") {
      return 0;
    }
    const subtotal = calculateSubtotal();
    return subtotal * (scopeGapBuffer / 100);
  };

  const calculateGeneralConditions = () => {
    const subtotal = calculateSubtotal();
    const buffer = calculateScopeGapBuffer();
    const gcPct = parseFloat(generalConditions) || 0;
    return (subtotal + buffer) * (gcPct / 100);
  };

  const calculateGCMarkup = () => {
    const subtotal = calculateSubtotal();
    const buffer = calculateScopeGapBuffer();
    const gcConditions = calculateGeneralConditions();
    const markup = parseFloat(gcMarkup) || 0;
    return (subtotal + buffer + gcConditions) * (markup / 100);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const buffer = calculateScopeGapBuffer();
    const gcConditions = calculateGeneralConditions();
    const markup = calculateGCMarkup();
    return subtotal + buffer + gcConditions + markup;
  };

  const handleSaveProject = async () => {
    // Validation
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    if (!totalSqft || parseFloat(totalSqft) <= 0) {
      toast.error("Please enter a valid project square footage");
      return;
    }
    if (!generalConditions || parseFloat(generalConditions) < 0) {
      toast.error("Please enter a valid General Conditions percentage");
      return;
    }
    if (!gcMarkup || parseFloat(gcMarkup) < 0) {
      toast.error("Please enter a valid GC markup percentage");
      return;
    }
    if (lineItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }
    if (lineItems.some(item => !item.scopeName)) {
      toast.error("Please select a scope for all line items");
      return;
    }

    // Check for zero quantities and warn user, but allow saving
    const zeroQtyItems = lineItems.filter(item => item.quantity === 0);
    if (zeroQtyItems.length > 0) {
      toast.warning(`${zeroQtyItems.length} line item(s) have zero quantity and will be saved as placeholders.`);
    }

    const project: Project = {
      id: crypto.randomUUID(),
      userId: user?.id,
      projectName,
      address,
      gcCompanyName: gcCompanyName || undefined,
      gcMarkupPercentage: parseFloat(gcMarkup),
      generalConditionsPercentage: parseFloat(generalConditions),
      lineItems,
      subtotal: calculateSubtotal(),
      grandTotal: calculateGrandTotal(),
      categoryBreakdown: calculateCategoryBreakdown(lineItems),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status,
      notes: projectNotes,
      scopeGapBufferPercentage: scopeGapBuffer,
      templateType,
    };

    try {
      await dataService.saveProject(project);

      // Clear form
      setProjectName("");
      setAddress("");
      setGcCompanyName("");
      setGcMarkup("");
      setGeneralConditions("");
      setStatus("Draft");
      setProjectNotes("");
      setLineItems([]);

      toast.success("Project saved successfully!");
      
      // Redirect to projects tab
      setTimeout(() => {
        onProjectSaved();
      }, 500);
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    }
  };

  // Group scopes by category
  const scopesByCategory = categories.map(category => ({
    category,
    scopes: scopeOfWorkData.filter(scope => scope.group === category),
  }));

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      {showTemplateSelector ? (
        <TemplateSelector
          onSelectTemplate={handleSelectTemplate}
          onStartFromScratch={handleStartFromScratch}
        />
      ) : (
        <>
          {/* Sticky Add Line Item Button - Only show when there are line items */}
          {lineItems.length > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <Button
                onClick={addLineItem}
                size="lg"
                className="shadow-lg hover:shadow-xl transition-shadow"
                style={{ backgroundColor: '#F7931E', borderColor: '#F7931E' }}
              >
                <Plus className="size-5 mr-2" />
                Add to End
              </Button>
            </div>
          )}
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToTemplates}
                  className="h-8"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Templates
                </Button>
              </div>
              <CardTitle className="text-lg md:text-xl">Project Details</CardTitle>
              <div className="w-[140px]"></div> {/* Spacer for alignment */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-tutorial="project-details">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    data-tutorial="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalSqft">Total Square Footage *</Label>
                  <Input
                    id="totalSqft"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={totalSqft}
                    onChange={(e) => setTotalSqft(e.target.value)}
                    placeholder="Enter total sqft"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="generalConditions">General Conditions (%) *</Label>
                    <HelpTooltip content={helpText.generalConditions} />
                  </div>
                  <Input
                    id="generalConditions"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    data-tutorial="gc-controls"
                    value={generalConditions}
                    onChange={(e) => setGeneralConditions(e.target.value)}
                    placeholder="Enter general conditions %"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="gcMarkup">GC Markup (%) *</Label>
                    <HelpTooltip content={helpText.gcMarkup} />
                  </div>
                  <Input
                    id="gcMarkup"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={gcMarkup}
                    onChange={(e) => setGcMarkup(e.target.value)}
                    placeholder="Enter markup percentage"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="scopeGapBuffer">Scope Gap Buffer (%)</Label>
                    <HelpTooltip content="This buffer accounts for scope items commonly missed in conceptual budgets, including electrical work triggered by layout changes, HVAC adjustments, patching/finishing, blocking for fixtures, and unforeseen site conditions. Standard practice for preliminary budgets." />
                  </div>
                  <Select value={scopeGapBuffer.toString()} onValueChange={(value) => setScopeGapBuffer(parseInt(value))}>
                    <SelectTrigger id="scopeGapBuffer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10">10% (Recommended)</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter project address"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gcCompanyName">GC Company Name (Optional)</Label>
                  <Input
                    id="gcCompanyName"
                    value={gcCompanyName}
                    onChange={(e) => setGcCompanyName(e.target.value)}
                    placeholder="Enter company providing this budget"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="status">Status</Label>
                    <HelpTooltip content={`${helpText.projectStatus.Draft} | ${helpText.projectStatus.Active} | ${helpText.projectStatus.Completed} | ${helpText.projectStatus.Archived}`} />
                  </div>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectNotes">Project Notes</Label>
                  <Textarea
                    id="projectNotes"
                    value={projectNotes}
                    onChange={(e) => setProjectNotes(e.target.value)}
                    placeholder="Enter any notes about this project"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Coming Soon Banner */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300">
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="text-sm md:text-base font-medium">Voice to Budget w/ AI assisted budgets coming soon</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <CardTitle className="text-lg md:text-xl">Line Items</CardTitle>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div data-tutorial="assemblies">
                  <AssemblySelector 
                    onSelectAssembly={handleSelectAssembly}
                    totalProjectSqft={parseFloat(totalSqft) || 0}
                    existingLineItems={lineItems}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportPDF}
                  disabled={!projectName || !address || lineItems.length === 0}
                  data-tutorial="save-export"
                >
                  <FileDown className="size-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={addLineItem} size="sm" data-tutorial="add-line-item">
                  <Plus className="size-4 mr-2" />
                  Add Line Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lineItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No line items yet. Click "Add Package" for pre-built bundles or "Add Line Item" to add individual items.
                </div>
              ) : (
                <div className="space-y-0" data-tutorial="line-items-table">
                  {lineItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {/* Insert button - appears before this item */}
                      <div className="flex justify-center py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertLineItemAt(index)}
                          className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Plus className="size-3 mr-1" />
                          Insert line item here
                        </Button>
                      </div>
                      
                      {/* Line Item Card */}
                      <div 
                        className={`border p-3 md:p-4 rounded-lg space-y-3 ${
                          item.scopeName && item.quantity === 0 
                            ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20' 
                            : ''
                        }`}
                      >
                        {item.scopeName && item.quantity === 0 && (
                          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
                            <AlertCircle className="size-4" />
                            <span>Placeholder - Quantity is zero</span>
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Label>Scope of Work</Label>
                            {item.scopeName && helpText.scopeDescriptions[item.scopeName as keyof typeof helpText.scopeDescriptions] && (
                              <HelpTooltip content={helpText.scopeDescriptions[item.scopeName as keyof typeof helpText.scopeDescriptions]} />
                            )}
                          </div>
                          
                          {/* Show disabled input for assembly line items */}
                          {item.isAssembly ? (
                            <>
                              <Input
                                value={item.scopeName}
                                disabled
                                className="text-sm"
                              />
                              <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                                <Package className="size-3" />
                                Assembly Package - {item.notes}
                              </p>
                            </>
                          ) : (
                            /* Regular Select dropdown for normal line items */
                            <>
                              <Select
                                value={item.scopeName}
                                onValueChange={(value) => updateLineItemScope(item.id, value)}
                                disabled={item.unitType === 'each' && !scopeOfWorkData.find(s => s.name === item.scopeName)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select scope" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CUSTOM_INPUT" className="font-medium text-[#F7931E]">
                                    ✏️ Custom Input
                                  </SelectItem>
                                  {scopesByCategory.map(({ category, scopes }) => (
                                    <div key={category}>
                                      <div className="px-2 py-1.5 font-medium text-sm text-muted-foreground">
                                        {category}
                                      </div>
                                      {scopes.map((scope) => (
                                        <SelectItem key={scope.name} value={scope.name} className="pl-4">
                                          {scope.name}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ))}
                                </SelectContent>
                              </Select>
                              {item.unitType === 'each' && !scopeOfWorkData.find(s => s.name === item.scopeName) && item.notes && !item.isAssembly && (
                                <p className="text-xs text-muted-foreground italic">
                                  📦 Assembly Package - {item.notes}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        
                        {/* Custom Scope Name Input - Only for Custom Items */}
                        {item.isCustom && item.scopeName === "CUSTOM_INPUT" && (
                          <div className="space-y-2">
                            <Label>Custom Scope Name</Label>
                            <Input
                              value={item.customScopeName || ""}
                              onChange={(e) => updateCustomScopeName(item.id, e.target.value)}
                              placeholder="e.g., Pickleball Court Installation"
                              className="text-sm"
                            />
                          </div>
                        )}
                        
                        {item.scopeName && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <Label>Unit Type</Label>
                                {item.unitType && helpText.unitTypes[item.unitType as keyof typeof helpText.unitTypes] && (
                                  <HelpTooltip content={helpText.unitTypes[item.unitType as keyof typeof helpText.unitTypes]} />
                                )}
                              </div>
                              <Input value={item.unitType} disabled className="text-sm" />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <Label>Quantity</Label>
                                {!item.isCustom && (() => {
                                  const scope = scopeOfWorkData.find(s => s.name === item.scopeName);
                                  return scope?.unitReasoning ? (
                                    <HelpTooltip content={scope.unitReasoning} />
                                  ) : null;
                                })()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  step="1"
                                  value={item.quantity || ""}
                                  onChange={(e) => updateLineItemQuantity(item.id, parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="text-sm"
                                  disabled={item.isCustom}
                                />
                                {!item.isCustom && (
                                  <QuantityCalculator
                                    onUseQuantity={(quantity) => updateLineItemQuantity(item.id, quantity)}
                                    currentQuantity={item.quantity}
                                  />
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Unit Cost</Label>
                              {item.isCustom ? (
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  step="0.01"
                                  value={item.unitCost || ""}
                                  onChange={(e) => updateCustomUnitCost(item.id, parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  className="text-sm"
                                />
                              ) : (
                                <Input
                                  value={`$${item.unitCost.toFixed(2)}`}
                                  disabled
                                  className="text-sm"
                                />
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Total</Label>
                              <Input
                                value={`$${item.total.toFixed(2)}`}
                                disabled
                                className="text-sm"
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                          {item.scopeName && (
                            <div className="flex-1 space-y-2">
                              <Label>Line Item Notes</Label>
                              <Textarea
                                value={item.notes || ""}
                                onChange={(e) => updateLineItemNotes(item.id, e.target.value)}
                                placeholder="Enter any notes for this line item"
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                          )}
                          
                          {item.scopeName && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDuplicateLineItem(item)}
                              className="self-end mb-2"
                              title="Duplicate this line item"
                            >
                              <Copy className="size-4 text-muted-foreground" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(item.id)}
                            className="self-end mb-2"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {lineItems.length > 0 && (
            <>
              <div data-tutorial="budget-summary">
                <BudgetSummaryChart lineItems={lineItems} />
              </div>

              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription className="text-sm">
                  <strong>Budget Range Estimate:</strong> {formatCurrency(calculateGrandTotal() * 0.85)} - {formatCurrency(calculateGrandTotal() * 1.15)}
                  <br />
                  <span className="text-muted-foreground">{helpText.budgetDisclaimer}</span>
                </AlertDescription>
              </Alert>

              {totalSqft && parseFloat(totalSqft) > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Cost Per Square Foot Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Your Project Cost per Sqft:</span>
                      <span className="font-medium">${(calculateGrandTotal() / parseFloat(totalSqft)).toFixed(2)}/sqft</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Typical ranges by project type:</p>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        <div className="flex items-center gap-2">
                          <span>Office:</span>
                          <span>${benchmarkData.costPerSqFt.office.min}-${benchmarkData.costPerSqFt.office.max}/sqft</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Retail:</span>
                          <span>${benchmarkData.costPerSqFt.retail.min}-${benchmarkData.costPerSqFt.retail.max}/sqft</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Restaurant:</span>
                          <span>${benchmarkData.costPerSqFt.restaurant.min}-${benchmarkData.costPerSqFt.restaurant.max}/sqft</span>
                        </div>

                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
                <CardHeader>
                  <Collapsible open={showNotIncluded} onOpenChange={setShowNotIncluded}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
                      <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                        <AlertCircle className="size-5 text-amber-600" />
                        What's NOT Included in This Estimate
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {showNotIncluded ? "Hide" : "Show"}
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-4">
                        <ul className="space-y-2 text-sm">
                          {helpText.notIncluded.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-amber-600 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                          These items may add 10-30% to your total project cost. Discuss with your contractor for a comprehensive quote.
                        </p>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </CardHeader>
              </Card>

              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="space-y-2 text-sm md:text-base">
                    <div className="flex justify-between items-center gap-4">
                      <span className="flex-shrink-0">Subtotal:</span>
                      <span className="font-mono text-right break-all">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    
                    {/* Scope Gap Buffer - Always show */}
                    <div className="flex justify-between items-center gap-4">
                      <span className="flex-shrink-0">Scope Gap Buffer ({scopeGapBuffer || 0}%):</span>
                      <span className="font-mono text-right break-all">{formatCurrency(calculateScopeGapBuffer())}</span>
                    </div>
                    
                    <div className="flex justify-between items-center gap-4">
                      <span className="flex-shrink-0">General Conditions ({generalConditions || 0}%):</span>
                      <span className="font-mono text-right break-all">{formatCurrency(calculateGeneralConditions())}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="flex-shrink-0">GC Markup ({gcMarkup || 0}%):</span>
                      <span className="font-mono text-right break-all">{formatCurrency(calculateGCMarkup())}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t gap-4">
                      <span className="flex-shrink-0">Preliminary Total:</span>
                      <span className="font-mono text-right break-all">{formatCurrency(calculateGrandTotal())}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground text-xs md:text-sm gap-4">
                      <span className="flex-shrink-0">Estimated Range (±15%):</span>
                      <span className="font-mono text-right break-all">{formatCurrency(calculateGrandTotal() * 0.85)} - {formatCurrency(calculateGrandTotal() * 1.15)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {lineItems.length === 0 && (
            <Card>
              <CardContent className="pt-4 md:pt-6">
                <div className="space-y-2 text-sm md:text-base">
                  <div className="flex justify-between items-center gap-4">
                    <span className="flex-shrink-0">Subtotal:</span>
                    <span className="font-mono text-right break-all">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="flex-shrink-0">General Conditions ({generalConditions || 0}%):</span>
                    <span className="font-mono text-right break-all">{formatCurrency(calculateGeneralConditions())}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="flex-shrink-0">GC Markup ({gcMarkup || 0}%):</span>
                    <span className="font-mono text-right break-all">{formatCurrency(calculateGCMarkup())}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t gap-4">
                    <span className="flex-shrink-0">Grand Total:</span>
                    <span className="font-mono text-right break-all">{formatCurrency(calculateGrandTotal())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pb-4">
            <Button onClick={handleSaveProject} size="lg" className="w-full sm:w-auto">
              Save Project
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
