import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Package, CheckCircle, Percent, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { assemblies, assemblyCategories, Assembly, createCommonAreaAssembly } from '../data/assemblies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { scopeOfWorkData } from '../data/scopeOfWork';
import { formatCurrency } from '../utils/formatCurrency';
import { LineItem } from '../types/project';
import { toast } from 'sonner@2.0.3';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

interface AssemblySelectorProps {
  onSelectAssembly: (assembly: Assembly, quantity: number) => void;
  totalProjectSqft?: number;
  existingLineItems?: LineItem[];
}

export function AssemblySelector({ onSelectAssembly, totalProjectSqft, existingLineItems }: AssemblySelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(assemblyCategories[0] || 'Office');
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
  const [selectedAssembly, setSelectedAssembly] = useState<Assembly | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);

  const handleSelectClick = (assembly: Assembly) => {
    // Special handling for dynamic common area - add directly without quantity dialog
    if (assembly.id === 'common-area-dynamic') {
      onSelectAssembly(assembly, 1);
      setOpen(false);
      toast.success(`Added ${assembly.name}`);
      return;
    }
    
    setSelectedAssembly(assembly);
    setQuantity(1);
    setQuantityDialogOpen(true);
  };

  const handleConfirmQuantity = () => {
    if (selectedAssembly) {
      const qty = typeof quantity === 'string' ? parseInt(quantity) : quantity;
      onSelectAssembly(selectedAssembly, qty);
      setQuantityDialogOpen(false);
      setOpen(false);
      setSelectedAssembly(null);
      setQuantity(1);
    }
  };

  const getDiscountForQuantity = (assembly: Assembly, qty: number): number => {
    if (!assembly.scaleDiscounts || assembly.scaleDiscounts.length === 0) {
      return 0;
    }
    
    const tier = assembly.scaleDiscounts.find(
      discount => qty >= discount.minQty && qty <= discount.maxQty
    );
    
    return tier ? tier.discountPercent : 0;
  };

  const currentDiscount = selectedAssembly ? getDiscountForQuantity(selectedAssembly, typeof quantity === 'string' ? parseInt(quantity) || 0 : quantity) : 0;

  const filteredAssemblies = assemblies.filter(a => a.category === selectedCategory);

  // Calculate remaining common area square footage
  const calculateCommonAreaSqft = (): number => {
    if (!totalProjectSqft) return 0;
    
    const projectSqft = parseFloat(totalProjectSqft.toString()) || 0;
    if (projectSqft <= 0) return 0;
    
    // Calculate total square footage used by assemblies (excluding dynamic common area)
    let usedSqft = 0;
    if (existingLineItems) {
      existingLineItems.forEach(item => {
        // Skip dynamic common area - we're calculating how much is available FOR it
        if (item.isDynamicCommonArea) {
          return;
        }
        
        // Use the stored assemblySqft property if available (for assembly line items)
        if (item.isAssembly && item.assemblySqft) {
          usedSqft += item.assemblySqft * item.quantity;
        }
      });
    }
    
    const remainingSqft = projectSqft - usedSqft;
    return remainingSqft > 0 ? Math.round(remainingSqft) : 0;
  };

  const commonAreaSqft = calculateCommonAreaSqft();
  
  // Check if common area already exists
  const hasCommonArea = existingLineItems?.some(item => item.isDynamicCommonArea) || false;
  
  const canAddCommonArea = commonAreaSqft > 0 && !hasCommonArea;

  const handleAddCommonArea = () => {
    const commonAreaAssembly = createCommonAreaAssembly(commonAreaSqft);
    onSelectAssembly(commonAreaAssembly, 1);
    setOpen(false);
  };

  // Create a list of assemblies that includes the dynamic common area if applicable
  const allAssemblies = [...assemblies];
  if (canAddCommonArea) {
    const commonAreaAssembly = createCommonAreaAssembly(commonAreaSqft);
    allAssemblies.push(commonAreaAssembly);
  }

  // Recalculate categories to include "Common Area" if it exists
  const allCategories = Array.from(new Set(allAssemblies.map(a => a.category)));
  
  // Sort categories: Office, Restrooms, Breakroom, Reception Area, then Common Area last
  const sortedCategories = allCategories.sort((a, b) => {
    if (a === 'Common Area') return 1;  // Common Area goes last
    if (b === 'Common Area') return -1; // Common Area goes last
    // Define the desired order for other categories
    const desiredOrder = ['Office', 'Restrooms', 'Breakroom', 'Reception Area'];
    return desiredOrder.indexOf(a) - desiredOrder.indexOf(b);
  });

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Package className="size-4 mr-2" />
            Add Package
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-xl max-h-[80vh] sm:max-h-[65vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select a Pre-Built Package</DialogTitle>
            <DialogDescription>
              Save time with ready-made bundles of commonly needed items. Perfect for offices, bathrooms, and more.
            </DialogDescription>
          </DialogHeader>

          {/* Mobile: Dropdown selector */}
          <div className="sm:hidden flex-shrink-0">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {sortedCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Tabs */}
          <div className="hidden sm:block flex-shrink-0">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: sortedCategories.length > 0 ? `repeat(${sortedCategories.length}, minmax(0, 1fr))` : 'auto' }}>
              {sortedCategories.map(category => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content area - scrollable */}
          <div className="flex-1 overflow-y-auto">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              {sortedCategories.map(category => (
                <TabsContent key={category} value={category} className="space-y-3 mt-4">
                  {allAssemblies
                    .filter(a => a.category === category)
                    .map(assembly => (
                      <Card key={assembly.id} className="cursor-pointer hover:border-[#F7931E] transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                            <div className="flex-1 w-full sm:w-auto">
                              <div className="flex flex-wrap items-center gap-2">
                                <CardTitle className="text-sm sm:text-base">{assembly.name}</CardTitle>
                                {assembly.scaleDiscounts && assembly.scaleDiscounts.some(d => d.discountPercent > 0) && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Percent className="size-3 mr-1" />
                                    Volume Pricing
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="text-xs mt-1">
                                {assembly.description}
                              </CardDescription>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleSelectClick(assembly)}
                              className="w-full sm:w-auto sm:ml-2 shrink-0"
                            >
                              Add Package
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="size-3.5 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">
                                {assembly.items.length} items included:
                              </span>
                            </div>
                            {assembly.items.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs pl-5">
                                <CheckCircle className="size-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-muted-foreground break-words">
                                    {item.scopeName}
                                    {item.notes && (
                                      <span className="text-xs italic ml-1">
                                        ({item.notes})
                                      </span>
                                    )}
                                  </span>
                                  <span className="ml-2 font-medium whitespace-nowrap">Qty: {item.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quantity Selection Dialog */}
      <Dialog open={quantityDialogOpen} onOpenChange={setQuantityDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Quantity</DialogTitle>
            <DialogDescription>
              How many "{selectedAssembly?.name}" do you want to add?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                type="number"
                inputMode="decimal"
                id="quantity"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or valid positive numbers
                  if (value === '') {
                    setQuantity('');
                  } else {
                    const parsed = parseInt(value);
                    if (!isNaN(parsed)) {
                      setQuantity(parsed);
                    }
                  }
                }}
                className="mt-1"
                placeholder="Enter quantity"
              />
            </div>

            {/* Show discount tiers if available - REMOVED FOR SIMPLICITY */}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setQuantityDialogOpen(false);
                setSelectedAssembly(null);
                setQuantity(1);
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmQuantity}
              disabled={quantity === '' || (typeof quantity === 'number' && quantity <= 0) || (typeof quantity === 'string' && parseInt(quantity) <= 0)}
            >
              Add to Budget
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
