import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { BudgetBuilderTab } from "./components/BudgetBuilderTab";
import { ProjectsTab } from "./components/ProjectsTab";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { UserMenu } from "./components/UserMenu";
import { migrateProjectsData } from "./utils/dataMigration";
import bldriqLogo from "figma:asset/a2929011f50be4b54dd5c1378acb40f8b0742766.png";

export default function App() {
  const [activeTab, setActiveTab] = useState("budget-builder");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Run data migration on mount
  useEffect(() => {
    migrateProjectsData();
  }, []);

  const handleProjectSaved = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab("projects");
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-white">
          <div className="max-w-6xl mx-auto p-4 md:p-6">
            <div className="flex items-center justify-between gap-3 md:gap-4 mb-2">
              <div className="flex items-center gap-3 md:gap-4">
                <img src={bldriqLogo} alt="BLDR IQ" className="h-8 md:h-10" />
                <div>
                  <h1 className="text-xl md:text-2xl">Budget Builder</h1>
                </div>
              </div>
              <UserMenu />
            </div>
            <p className="text-muted-foreground text-sm md:text-base">Create and manage construction project budgets with confidence</p>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <TabsList className="w-full justify-start bg-transparent h-auto p-0 space-x-4 md:space-x-8">
              <TabsTrigger 
                value="projects" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0 pb-3 md:pb-4 text-sm md:text-base"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="budget-builder"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0 pb-3 md:pb-4 text-sm md:text-base"
              >
                Budget BLDR
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="projects" className="mt-0">
          <ProjectsTab refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="budget-builder" className="mt-0">
          <BudgetBuilderTab onProjectSaved={handleProjectSaved} />
        </TabsContent>
      </Tabs>

        <Toaster />
      </div>
    </AuthProvider>
  );
}