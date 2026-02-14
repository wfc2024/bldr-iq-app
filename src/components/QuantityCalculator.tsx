import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calculator } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface QuantityCalculatorProps {
  onUseQuantity: (quantity: number) => void;
  currentQuantity?: number;
}

export function QuantityCalculator({ onUseQuantity, currentQuantity }: QuantityCalculatorProps) {
  const [open, setOpen] = useState(false);
  
  // Square Footage
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  
  // Linear Feet (Perimeter)
  const [perimeterLength, setPerimeterLength] = useState("");
  const [perimeterWidth, setPerimeterWidth] = useState("");
  
  // Add Multiple
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [value3, setValue3] = useState("");
  const [value4, setValue4] = useState("");
  
  // Calculate Square Footage
  const calculateSF = () => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    return l * w;
  };
  
  // Calculate Linear Feet (Perimeter)
  const calculateLF = () => {
    const l = parseFloat(perimeterLength) || 0;
    const w = parseFloat(perimeterWidth) || 0;
    return 2 * (l + w);
  };
  
  // Calculate Sum
  const calculateSum = () => {
    const v1 = parseFloat(value1) || 0;
    const v2 = parseFloat(value2) || 0;
    const v3 = parseFloat(value3) || 0;
    const v4 = parseFloat(value4) || 0;
    return v1 + v2 + v3 + v4;
  };
  
  const handleUseQuantity = (quantity: number) => {
    onUseQuantity(quantity);
    setOpen(false);
    
    // Clear all fields after use
    setLength("");
    setWidth("");
    setPerimeterLength("");
    setPerimeterWidth("");
    setValue1("");
    setValue2("");
    setValue3("");
    setValue4("");
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          type="button"
          title="Quick Quantity Calculator"
        >
          <Calculator className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Quick Calculator
            </h4>
            <p className="text-sm text-muted-foreground">
              Calculate quantities and use the result
            </p>
          </div>
          
          <Tabs defaultValue="square-footage" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="square-footage" className="text-xs">SF</TabsTrigger>
              <TabsTrigger value="linear-feet" className="text-xs">LF</TabsTrigger>
              <TabsTrigger value="add" className="text-xs">Add</TabsTrigger>
            </TabsList>
            
            {/* Square Footage Calculator */}
            <TabsContent value="square-footage" className="space-y-3 mt-3">
              <div className="space-y-2">
                <Label htmlFor="length" className="text-sm">Length (ft)</Label>
                <Input
                  id="length"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="0"
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width" className="text-sm">Width (ft)</Label>
                <Input
                  id="width"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="0"
                  className="h-8"
                />
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Result:</span>
                  <span className="text-lg font-bold" style={{ color: '#F7931E' }}>
                    {calculateSF().toLocaleString()} SF
                  </span>
                </div>
                <Button
                  onClick={() => handleUseQuantity(calculateSF())}
                  disabled={calculateSF() === 0}
                  className="w-full"
                  size="sm"
                  style={{ backgroundColor: '#F7931E', borderColor: '#F7931E' }}
                >
                  Use This Quantity
                </Button>
              </div>
            </TabsContent>
            
            {/* Linear Feet Calculator */}
            <TabsContent value="linear-feet" className="space-y-3 mt-3">
              <div className="space-y-2">
                <Label htmlFor="perimeterLength" className="text-sm">Length (ft)</Label>
                <Input
                  id="perimeterLength"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={perimeterLength}
                  onChange={(e) => setPerimeterLength(e.target.value)}
                  placeholder="0"
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="perimeterWidth" className="text-sm">Width (ft)</Label>
                <Input
                  id="perimeterWidth"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={perimeterWidth}
                  onChange={(e) => setPerimeterWidth(e.target.value)}
                  placeholder="0"
                  className="h-8"
                />
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Perimeter = 2(L + W)
                </p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Result:</span>
                  <span className="text-lg font-bold" style={{ color: '#F7931E' }}>
                    {calculateLF().toLocaleString()} LF
                  </span>
                </div>
                <Button
                  onClick={() => handleUseQuantity(calculateLF())}
                  disabled={calculateLF() === 0}
                  className="w-full"
                  size="sm"
                  style={{ backgroundColor: '#F7931E', borderColor: '#F7931E' }}
                >
                  Use This Quantity
                </Button>
              </div>
            </TabsContent>
            
            {/* Add Multiple Quantities */}
            <TabsContent value="add" className="space-y-3 mt-3">
              <div className="space-y-2">
                <Label className="text-sm">Add Multiple Values</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={value1}
                  onChange={(e) => setValue1(e.target.value)}
                  placeholder="Value 1"
                  className="h-8"
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={value2}
                  onChange={(e) => setValue2(e.target.value)}
                  placeholder="Value 2"
                  className="h-8"
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={value3}
                  onChange={(e) => setValue3(e.target.value)}
                  placeholder="Value 3 (optional)"
                  className="h-8"
                />
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={value4}
                  onChange={(e) => setValue4(e.target.value)}
                  placeholder="Value 4 (optional)"
                  className="h-8"
                />
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Total:</span>
                  <span className="text-lg font-bold" style={{ color: '#F7931E' }}>
                    {calculateSum().toLocaleString()}
                  </span>
                </div>
                <Button
                  onClick={() => handleUseQuantity(calculateSum())}
                  disabled={calculateSum() === 0}
                  className="w-full"
                  size="sm"
                  style={{ backgroundColor: '#F7931E', borderColor: '#F7931E' }}
                >
                  Use This Quantity
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}
