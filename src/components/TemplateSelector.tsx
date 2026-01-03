import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { FileText } from "lucide-react";
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-tutorial="template-cards">
        {projectTemplates.map((template) => (
          <Card key={template.name} className="hover:border-primary transition-colors cursor-pointer" onClick={() => onSelectTemplate(template)}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <FileText className="size-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <CardTitle className="text-base md:text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm mt-1">{template.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={(e) => {
                e.stopPropagation();
                onSelectTemplate(template);
              }}>
                Use This Template
              </Button>
            </CardContent>
          </Card>
        ))}
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
