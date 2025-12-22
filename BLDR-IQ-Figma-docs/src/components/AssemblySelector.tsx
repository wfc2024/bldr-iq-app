import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Package, CheckCircle } from 'lucide-react';
import { assemblies, assemblyCategories, Assembly } from '../data/assemblies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AssemblySelectorProps {
  onSelectAssembly: (assembly: Assembly) => void;
}

export function AssemblySelector({ onSelectAssembly }: AssemblySelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(assemblyCategories[0] || 'Office');

  const handleSelect = (assembly: Assembly) => {
    onSelectAssembly(assembly);
    setOpen(false);
  };

  const filteredAssemblies = assemblies.filter(a => a.category === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Package className="size-4 mr-2" />
          Add Assembly Package
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select an Assembly Package</DialogTitle>
          <DialogDescription>
            Quickly add groups of commonly bundled line items. Perfect for on-the-spot estimating.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${assemblyCategories.length}, 1fr)` }}>
            {assemblyCategories.map(category => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {assemblyCategories.map(category => (
            <TabsContent key={category} value={category} className="space-y-3 mt-4">
              {assemblies
                .filter(a => a.category === category)
                .map(assembly => (
                  <Card key={assembly.id} className="cursor-pointer hover:border-[#F7931E] transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{assembly.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {assembly.description}
                          </CardDescription>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleSelect(assembly)}
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
  );
}
