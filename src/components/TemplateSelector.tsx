import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Package } from "lucide-react";
import { projectTemplates, ProjectTemplate } from "../data/helpText";

interface TemplateSelectorProps {
  onSelectTemplate: (template: ProjectTemplate) => void;
  onStartFromScratch: () => void;
}

export function TemplateSelector({ onSelectTemplate, onStartFromScratch }: TemplateSelectorProps) {
  return (
    <div className="space-y-4 max-w-6xl mx-auto p-4 md:p-6" data-tutorial="templates">
      <div className="space-y-2" data-tutorial="template-intro">
        <h2 className="text-xl md:text-2xl">Start Your Project Budget</h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Choose a template to get started quickly, or start from scratch to build your own custom budget.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr" data-tutorial="template-cards">
        {projectTemplates.map((template, index) => {
          const isAssemblyTemplate = index === 0; // First template is the assembly-focused one
          return (
            <Card 
              key={template.name} 
              className={`hover:border-primary transition-colors ${isAssemblyTemplate ? 'border-[#F7931E] bg-orange-50/30 dark:bg-orange-950/20' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {isAssemblyTemplate ? (
                    <Package className="size-5 text-[#F7931E] mt-1 flex-shrink-0" />
                  ) : (
                    <FileText className="size-5 text-primary mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg flex items-center gap-2 flex-wrap">
                      {template.name}
                      {isAssemblyTemplate && (
                        <span className="text-xs font-normal bg-[#F7931E] text-white px-2 py-0.5 rounded">
                          RECOMMENDED
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">{template.description}</CardDescription>
                    {isAssemblyTemplate && (
                      <p className="text-xs text-[#F7931E] dark:text-orange-400 font-medium mt-2">
                        💡 Use "Add Package" button to quickly add offices, restrooms, breakrooms, and reception areas
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  variant={isAssemblyTemplate ? "default" : "outline"} 
                  className={`w-full ${isAssemblyTemplate ? 'bg-[#F7931E] hover:bg-[#e8851a] border-[#F7931E]' : ''}`}
                  onClick={() => onSelectTemplate(template)}
                >
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed" data-tutorial="start-from-scratch">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Don't see a template that fits? Start from scratch and build your own custom budget.
            </p>
            <Button onClick={onStartFromScratch} variant="secondary" size="lg">
              Start From Scratch
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
