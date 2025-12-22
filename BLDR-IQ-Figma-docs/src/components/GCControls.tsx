import { Button } from './ui/button';
import { Copy, FileDown, Package } from 'lucide-react';
import { LineItem } from '../types/project';
import { scopeOfWorkData } from '../data/scopeOfWork';
import { Assembly } from '../data/assemblies';
import { AssemblySelector } from './AssemblySelector';
import { toast } from 'sonner@2.0.3';

interface GCControlsProps {
  onAssemblySelect: (assembly: Assembly) => void;
  onDuplicateLineItem: (item: LineItem) => void;
  onExportPDF: () => void;
  disabled?: boolean;
}

export function GCControls({ onAssemblySelect, onDuplicateLineItem, onExportPDF, disabled }: GCControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <AssemblySelector onSelectAssembly={onAssemblySelect} />
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onExportPDF}
        disabled={disabled}
      >
        <FileDown className="size-4 mr-2" />
        Export PDF
      </Button>
    </div>
  );
}

// Hook for adding assembly items to line items
export const useAssemblyHandler = (setLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>) => {
  return (assembly: Assembly) => {
    const newItems: LineItem[] = assembly.items.map(assemblyItem => {
      const scope = scopeOfWorkData.find(s => s.name === assemblyItem.scopeName);
      if (!scope) return null;
      
      const total = assemblyItem.quantity * scope.defaultUnitCost;
      return {
        id: crypto.randomUUID(),
        scopeName: assemblyItem.scopeName,
        unitType: scope.unitType,
        quantity: assemblyItem.quantity,
        unitCost: scope.defaultUnitCost,
        total,
        notes: assemblyItem.notes || '',
      };
    }).filter(Boolean) as LineItem[];

    setLineItems(prev => [...prev, ...newItems]);
    toast.success(`Added ${assembly.name} (${newItems.length} items)`);
  };
};

// Hook for duplicating a line item
export const useDuplicateLineItem = (setLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>) => {
  return (item: LineItem) => {
    const duplicatedItem: LineItem = {
      ...item,
      id: crypto.randomUUID(),
      notes: item.notes ? `${item.notes} (Copy)` : '(Copy)',
    };
    
    setLineItems(prev => [...prev, duplicatedItem]);
    toast.success('Line item duplicated');
  };
};
