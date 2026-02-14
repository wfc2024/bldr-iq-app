import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Trash2, Edit2, Save, X, Plus, Copy, FileDown, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { scopeOfWorkData, categories } from "../data/scopeOfWork";
import { LineItem, Project } from "../types/project";
import { toast } from "sonner@2.0.3";
import { dataService } from "../services/dataService";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";
import { calculateCategoryBreakdown } from "../utils/categoryBreakdown";
import { downloadPDF } from "../utils/pdfExport";
import { BudgetSummaryChart } from "./BudgetSummaryChart";
import { AssemblySelector } from "./AssemblySelector";
import { HelpTooltip } from "./HelpTooltip";
import { helpText } from "../data/helpText";
import { Assembly } from "../data/assemblies";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import React from "react";

interface ProjectsTabProps {
  refreshTrigger: number;
}

export function ProjectsTab({ refreshTrigger }: ProjectsTabProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editedProject, setEditedProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProjects();
  }, [refreshTrigger, user]);

  const loadProjects = async () => {
    try {
      const userProjects = await dataService.getProjects(user?.id);
      // Sort by most recent first
      const sortedProjects = userProjects.sort((a: Project, b: Project) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setProjects(sortedProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    }
  };

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleEdit = (project: Project) => {
    setEditingProjectId(project.id);
    setEditedProject(JSON.parse(JSON.stringify(project)));
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditedProject(null);
  };

  const handleSaveEdit = async () => {
    if (!editedProject) return;

    // Validation
    if (!editedProject.projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    if (!editedProject.address.trim()) {
      toast.error("Please enter a project address");
      return;
    }
    if (editedProject.gcMarkupPercentage < 0) {
      toast.error("Please enter a valid GC markup percentage");
      return;
    }
    if (editedProject.lineItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }
    if (editedProject.lineItems.some(item => !item.scopeName)) {
      toast.error("Please select a scope for all line items");
      return;
    }

    // Check for zero quantities and warn user, but allow saving
    const zeroQtyItems = editedProject.lineItems.filter(item => item.quantity === 0);
    if (zeroQtyItems.length > 0) {
      toast.warning(`${zeroQtyItems.length} line item(s) have zero quantity and will be saved as placeholders.`);
    }

    // Recalculate totals
    const subtotal = editedProject.lineItems.reduce((sum, item) => sum + item.total, 0);
    const grandTotal = subtotal * (1 + editedProject.gcMarkupPercentage / 100);

    const updatedProject = {
      ...editedProject,
      subtotal,
      grandTotal,
      categoryBreakdown: calculateCategoryBreakdown(editedProject.lineItems),
      userId: user?.id,
    };

    try {
      await dataService.saveProject(updatedProject);
      await loadProjects();
      setEditingProjectId(null);
      setEditedProject(null);
      toast.success("Project updated successfully!");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    }
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      await dataService.deleteProject(projectToDelete, user?.id);
      await loadProjects();
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      toast.success("Project deleted successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleDuplicate = async (project: Project) => {
    const duplicatedProject: Project = {
      ...JSON.parse(JSON.stringify(project)),
      id: crypto.randomUUID(),
      userId: user?.id,
      projectName: `${project.projectName} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lineItems: project.lineItems.map(item => ({
        ...item,
        id: crypto.randomUUID(),
      })),
    };

    try {
      await dataService.saveProject(duplicatedProject);
      await loadProjects();
      toast.success("Project duplicated successfully!");
    } catch (error) {
      console.error("Error duplicating project:", error);
      toast.error("Failed to duplicate project");
    }
  };

  const handleExportPDF = (project: Project) => {
    try {
      downloadPDF(project, true);
      toast.success('PDF preview opened in new window');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please allow pop-ups for this site.');
    }
  };

  const addLineItemToEdit = () => {
    if (!editedProject) return;

    const newLineItem: LineItem = {
      id: crypto.randomUUID(),
      scopeName: "",
      unitType: "",
      quantity: 0,
      unitCost: 0,
      total: 0,
      notes: "",
    };

    setEditedProject({
      ...editedProject,
      lineItems: [...editedProject.lineItems, newLineItem],
    });
  };

  const insertLineItemAt = (index: number) => {
    if (!editedProject) return;

    const newLineItem: LineItem = {
      id: crypto.randomUUID(),
      scopeName: "",
      unitType: "",
      quantity: 0,
      unitCost: 0,
      total: 0,
      notes: "",
    };

    const newItems = [...editedProject.lineItems];
    newItems.splice(index, 0, newLineItem);
    
    setEditedProject({
      ...editedProject,
      lineItems: newItems,
    });
    toast.success('Line item inserted');
  };

  const removeLineItemFromEdit = (id: string) => {
    if (!editedProject) return;

    setEditedProject({
      ...editedProject,
      lineItems: editedProject.lineItems.filter(item => item.id !== id),
    });
  };

  const updateEditedLineItemScope = (id: string, scopeName: string) => {
    if (!editedProject) return;

    const scope = scopeOfWorkData.find(s => s.name === scopeName);
    if (!scope) return;

    setEditedProject({
      ...editedProject,
      lineItems: editedProject.lineItems.map(item => {
        if (item.id === id) {
          const total = item.quantity * scope.defaultUnitCost;
          return {
            ...item,
            scopeName,
            unitType: scope.unitType,
            unitCost: scope.defaultUnitCost,
            total,
          };
        }
        return item;
      }),
    });
  };

  const updateEditedLineItemQuantity = (id: string, quantity: number) => {
    if (!editedProject) return;

    setEditedProject({
      ...editedProject,
      lineItems: editedProject.lineItems.map(item => {
        if (item.id === id) {
          const total = quantity * item.unitCost;
          return {
            ...item,
            quantity,
            total,
          };
        }
        return item;
      }),
    });
  };

  const updateEditedLineItemNotes = (id: string, notes: string) => {
    if (!editedProject) return;

    setEditedProject({
      ...editedProject,
      lineItems: editedProject.lineItems.map(item => {
        if (item.id === id) {
          return { ...item, notes };
        }
        return item;
      }),
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-500";
      case "Active":
        return "bg-blue-500";
      case "Completed":
        return "bg-green-500";
      case "Archived":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  // Group scopes by category
  const scopesByCategory = categories.map(category => ({
    category,
    scopes: scopeOfWorkData.filter(scope => scope.group === category),
  }));

  if (projects.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm md:text-base">No projects yet. Create your first project in the Budget Builder tab.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-3 md:space-y-4">
      {projects.map((project) => {
        const isEditing = editingProjectId === project.id;
        const displayProject = isEditing && editedProject ? editedProject : project;
        const isExpanded = expandedProjects.has(project.id);

        return (
          <Card key={project.id}>
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col gap-3">
                <div className="flex-1 space-y-2">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Project Name</Label>
                          <Input
                            value={displayProject.projectName}
                            onChange={(e) => setEditedProject({ ...editedProject!, projectName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>GC Markup (%)</Label>
                          <Input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.01"
                            value={displayProject.gcMarkupPercentage}
                            onChange={(e) => setEditedProject({ ...editedProject!, gcMarkupPercentage: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={displayProject.status}
                            onValueChange={(value: any) => setEditedProject({ ...editedProject!, status: value })}
                          >
                            <SelectTrigger>
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
                      </div>
                      {/* Scope Gap Buffer - Only for Conceptual Template */}
                      {displayProject.templateType === "Conceptual BLD w/ Pre-Packaged Assemblies" && (
                        <div className="space-y-2">
                          <Label>Scope Gap Buffer (%)</Label>
                          <Select
                            value={(displayProject.scopeGapBufferPercentage || 10).toString()}
                            onValueChange={(value) => setEditedProject({ ...editedProject!, scopeGapBufferPercentage: parseInt(value) })}
                          >
                            <SelectTrigger>
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
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Address</Label>
                          <Input
                            value={displayProject.address}
                            onChange={(e) => setEditedProject({ ...editedProject!, address: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>GC Company Name (Optional)</Label>
                          <Input
                            value={displayProject.gcCompanyName || ""}
                            onChange={(e) => setEditedProject({ ...editedProject!, gcCompanyName: e.target.value })}
                            placeholder="Enter company providing this budget"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Project Notes</Label>
                        <Textarea
                          value={displayProject.notes || ""}
                          onChange={(e) => setEditedProject({ ...editedProject!, notes: e.target.value })}
                          placeholder="Enter any notes about this project"
                          rows={3}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg md:text-xl">{displayProject.projectName}</CardTitle>
                      </div>
                      {displayProject.gcCompanyName && (
                        <p className="text-sm md:text-base" style={{ color: '#F7931E', fontWeight: 500 }}>
                          {displayProject.gcCompanyName}
                        </p>
                      )}
                      <p className="text-muted-foreground text-sm md:text-base">{displayProject.address}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Last updated: {formatDate(displayProject.updatedAt)}
                      </p>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCancelEdit} className="flex-1 sm:flex-none">
                        <X className="size-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit} className="flex-1 sm:flex-none">
                        <Save className="size-4 mr-2" />
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleExportPDF(project)} className="flex-1 sm:flex-none">
                        <FileDown className="size-4 sm:mr-2" />
                        <span className="hidden sm:inline">Export</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDuplicate(project)} className="flex-1 sm:flex-none">
                        <Copy className="size-4 sm:mr-2" />
                        <span className="hidden sm:inline">Duplicate</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(project)} className="flex-1 sm:flex-none">
                        <Edit2 className="size-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(project.id)} className="flex-1 sm:flex-none">
                        <Trash2 className="size-4 sm:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            {!isEditing && (
              <Collapsible open={isExpanded} onOpenChange={() => toggleProjectExpansion(project.id)}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between px-4 md:px-6 py-3 rounded-none border-t text-sm md:text-base">
                    <span>View Budget Details</span>
                    {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-4 space-y-4 p-4 md:p-6">
                    {project.notes && (
                      <div className="space-y-2 pb-4 border-b">
                        <Label>Project Notes</Label>
                        <p className="text-sm">{project.notes}</p>
                      </div>
                    )}

                    {/* Cost Breakdown Visual */}
                    <BudgetSummaryChart lineItems={project.lineItems} />

                    <div className="space-y-2">
                      <Label>Line Items</Label>
                      {project.lineItems.map((item) => (
                        <div 
                          key={item.id} 
                          className={`border p-3 rounded-lg space-y-2 ${
                            item.quantity === 0 
                              ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20' 
                              : ''
                          }`}
                        >
                          {item.quantity === 0 && (
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
                              <AlertCircle className="size-4" />
                              <span>Placeholder - Quantity is zero</span>
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="flex-1">
                              <span className="text-sm md:text-base">
                                {item.isCustom && item.customScopeName ? item.customScopeName : item.scopeName}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-right text-sm md:text-base">
                              <span>{item.quantity} {item.unitType}</span>
                              <span>{formatCurrency(item.unitCost)}/{item.unitType}</span>
                              <span>{formatCurrency(item.total)}</span>
                            </div>
                          </div>
                          {item.notes && (
                            <div className="text-xs md:text-sm text-muted-foreground pl-4 border-l-2">
                              Notes: {item.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t space-y-2 text-sm md:text-base">
                      <div className="flex justify-between items-center">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(project.subtotal)}</span>
                      </div>
                      
                      {/* Scope Gap Buffer - Only for Conceptual Template */}
                      {project.templateType === "Conceptual BLD w/ Pre-Packaged Assemblies" && project.scopeGapBufferPercentage && (
                        <div className="flex justify-between items-center">
                          <span>Scope Gap Buffer ({project.scopeGapBufferPercentage}%):</span>
                          <span>{formatCurrency(project.subtotal * (project.scopeGapBufferPercentage / 100))}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span>GC Markup ({project.gcMarkupPercentage}%):</span>
                        <span>{formatCurrency(project.grandTotal - project.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span>Grand Total:</span>
                        <span>{formatCurrency(project.grandTotal)}</span>
                      </div>
                      <div className="pt-3 border-t bg-blue-50/50 dark:bg-blue-950/20 -mx-4 md:-mx-6 px-4 md:px-6 py-3 mt-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">Preliminary Budget Range (±15%)</span>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Low Estimate:</span>
                            <span className="text-sm">{formatCurrency(project.grandTotal * 0.85)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">High Estimate:</span>
                            <span className="text-sm">{formatCurrency(project.grandTotal * 1.15)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            )}

            {isEditing && (
              <CardContent className="space-y-4 p-4 md:p-6">
                {/* Sticky Add Line Item Button - Only show when there are line items */}
                {displayProject.lineItems.length > 0 && (
                  <div className="fixed bottom-6 right-6 z-50">
                    <Button
                      onClick={addLineItemToEdit}
                      size="lg"
                      className="shadow-lg"
                      style={{ backgroundColor: '#F7931E' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e68a1b'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F7931E'}
                    >
                      <Plus className="size-5 mr-2" />
                      Add Line Item
                    </Button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <Label>Line Items</Label>
                  <Button onClick={addLineItemToEdit} size="sm" className="w-full sm:w-auto">
                    <Plus className="size-4 mr-2" />
                    Add Line Item
                  </Button>
                </div>

                {displayProject.lineItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No line items yet. Click "Add Line Item" to get started.
                  </div>
                ) : (
                  <div className="space-y-0">
                    {displayProject.lineItems.map((item, index) => (
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
                          {item.quantity === 0 && (
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
                              <AlertCircle className="size-4" />
                              <span>Placeholder - Quantity is zero</span>
                            </div>
                          )}
                          
                          {/* Scope Selection */}
                          <div className="space-y-2">
                            <Label>Scope of Work</Label>
                            <Select
                              value={item.scopeName}
                              onValueChange={(value) => updateEditedLineItemScope(item.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select scope" />
                              </SelectTrigger>
                              <SelectContent>
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
                          </div>
                          
                          {/* Unit Details Grid */}
                          {item.scopeName && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="space-y-2">
                                <Label>Unit Type</Label>
                                <Input value={item.unitType} disabled className="text-sm bg-muted" />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  step="1"
                                  value={item.quantity || ""}
                                  onChange={(e) => updateEditedLineItemQuantity(item.id, parseFloat(e.target.value) || 0)}
                                  className="text-sm"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Unit Cost</Label>
                                <Input
                                  value={formatCurrency(item.unitCost)}
                                  disabled
                                  className="text-sm bg-muted"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Total</Label>
                                <Input
                                  value={formatCurrency(item.total)}
                                  disabled
                                  className="text-sm bg-muted"
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Notes and Delete */}
                          {item.scopeName && (
                            <div className="flex gap-3">
                              <div className="flex-1 space-y-2">
                                <Label>Line Item Notes</Label>
                                <Textarea
                                  value={item.notes || ""}
                                  onChange={(e) => updateEditedLineItemNotes(item.id, e.target.value)}
                                  placeholder="Enter any notes for this line item"
                                  rows={2}
                                  className="text-sm"
                                />
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLineItemFromEdit(item.id)}
                                className="self-end"
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                          
                          {/* Delete button for items without scope */}
                          {!item.scopeName && (
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLineItemFromEdit(item.id)}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t space-y-2 text-sm md:text-base">
                  <div className="flex justify-between items-center">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(displayProject.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>GC Markup ({displayProject.gcMarkupPercentage}%):</span>
                    <span>{formatCurrency(displayProject.grandTotal - displayProject.subtotal)}</span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
