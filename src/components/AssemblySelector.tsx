import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Package, CheckCircle, Percent, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { assemblies, assemblyCategories, Assembly, createCommonAreaAssembly } from '../data/assemblies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  const [quantity, setQuantity] = useState(1);

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
      onSelectAssembly(selectedAssembly, quantity);
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

  const currentDiscount = selectedAssembly ? getDiscountForQuantity(selectedAssembly, quantity) : 0;

  const filteredAssemblies = assemblies.filter(a => a.category === selectedCategory);

  // Calculate remaining common area square footage
  const calculateCommonAreaSqft = (): number => {
    if (!totalProjectSqft) return 0;
    
    const projectSqft = parseFloat(totalProjectSqft.toString()) || 0;
    if (projectSqft <= 0) return 0;
    
    // Calculate total square footage used by assemblies
    let usedSqft = 0;
    if (existingLineItems) {
      existingLineItems.forEach(item => {
        // Check if this line item is an assembly with a footprint
        const assembly = assemblies.find(a => a.name === item.scopeName);
        if (assembly && assembly.squareFeet) {
          usedSqft += assembly.squareFeet * item.quantity;
        }
      });
    }
    
    const remainingSqft = projectSqft - usedSqft;
    return remainingSqft > 0 ? Math.round(remainingSqft) : 0;
  };

  const commonAreaSqft = calculateCommonAreaSqft();
  const canAddCommonArea = commonAreaSqft > 0;

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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Package className="size-4 mr-2" />
            Add Package
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a Pre-Built Package</DialogTitle>
            <DialogDescription>
              Save time with ready-made bundles of commonly needed items. Perfect for offices, bathrooms, and more.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${allCategories.length}, 1fr)` }}>
              {allCategories.map(category => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {allCategories.map(category => (
              <TabsContent key={category} value={category} className="space-y-3 mt-4">
                {allAssemblies
                  .filter(a => a.category === category)
                  .map(assembly => (
                    <Card key={assembly.id} className="cursor-pointer hover:border-[#F7931E] transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{assembly.name}</CardTitle>
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
                            className="ml-2"
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
                              <div className="flex-1">
                                <span className="text-muted-foreground">
                                  {item.scopeName}
                                  {item.notes && (
                                    <span className="text-xs italic ml-1">
                                      ({item.notes})
                                    </span>
                                  )}
                                </span>
                                <span className="ml-2 font-medium">Qty: {item.quantity}</span>
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
                id="quantity"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="mt-1"
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
            >
              Add to Budget
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
