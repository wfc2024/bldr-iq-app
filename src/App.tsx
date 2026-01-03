import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { BudgetBuilderTab } from "./components/BudgetBuilderTab";
import { ProjectsTab } from "./components/ProjectsTab";
import { HelpTab } from "./components/HelpTab";
import { GettingStartedModal } from "./components/GettingStartedModal";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { UserMenu } from "./components/UserMenu";
import { migrateProjectsData } from "./utils/dataMigration";
import { AlertTriangle, FileWarning } from "lucide-react";
import bldriqLogo from "figma:asset/a2929011f50be4b54dd5c1378acb40f8b0742766.png";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

export default function App() {
  const [activeTab, setActiveTab] = useState("budget-builder");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showTestingModal, setShowTestingModal] = useState(true);
  const [showGettingStarted, setShowGettingStarted] = useState(false);
  const [runTutorial, setRunTutorial] = useState(false);
  const [resetBudgetBuilder, setResetBudgetBuilder] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [autoStartFromScratch, setAutoStartFromScratch] = useState(false);

  // Check if user has seen the getting started modal
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      // Show getting started modal after testing modal is dismissed
      const timer = setTimeout(() => {
        if (!showTestingModal) {
          setShowGettingStarted(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showTestingModal]);

  // Run data migration on mount
  useEffect(() => {
    migrateProjectsData();
  }, []);

  const handleProjectSaved = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab("projects");
  };

  const handleStartTutorial = () => {
    setShowGettingStarted(false);
    localStorage.setItem("hasSeenWelcome", "true");
    setActiveTab("budget-builder");
    setResetBudgetBuilder(true);
    // Wait longer for the reset to complete and template selector to render
    setTimeout(() => {
      setResetBudgetBuilder(false);
    }, 100);
    // Start tutorial after reset is complete
    setTimeout(() => {
      setRunTutorial(true);
    }, 800);
  };

  const handleSkipGettingStarted = () => {
    setShowGettingStarted(false);
    localStorage.setItem("hasSeenWelcome", "true");
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, action, type } = data;
    
    // When moving from step 2 (template selector) to step 3
    if (type === 'step:after' && index === 1 && action === 'next') {
      // Trigger "Start From Scratch" automatically
      setAutoStartFromScratch(true);
      // Wait for the elements to render before allowing next step
      setTimeout(() => {
        setStepIndex(2);
      }, 600);
      return;
    }
    
    // Update step index for normal navigation
    if (type === 'step:after' && action === 'next') {
      setStepIndex(index + 1);
    } else if (type === 'step:after' && action === 'prev') {
      setStepIndex(index - 1);
    }
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTutorial(false);
      setStepIndex(0);
      setAutoStartFromScratch(false);
      localStorage.setItem("hasCompletedTutorial", "true");
    }
  };

  // Tutorial steps - Only include steps where targets exist at tutorial start
  const tutorialSteps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Welcome to BLDR IQ Budget Builder!</h3>
          <p>Let's take a quick tour to help you create your first construction budget in just a few simple steps.</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tutorial="templates"]',
      content: (
        <div>
          <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Step 1: Choose Your Starting Point</h3>
          <p>Start by choosing a pre-built template for common project types (Office, Retail, Restaurant), or click 'Start From Scratch' to build your own custom budget.</p>
        </div>
      ),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[data-tutorial="templates"]',
      content: (
        <div>
          <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Step 2: Fill in Project Details</h3>
          <p>After selecting a template or starting from scratch, you'll fill in project details like name, address, square footage, general conditions percentage, and GC markup.</p>
        </div>
      ),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: "body",
      content: (
        <div>
          <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Step 3: Add Budget Line Items</h3>
          <p>Add line items for different scopes of work (flooring, plumbing, electrical, etc.) with quantities and costs. The app calculates totals automatically!</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "body",
      content: (
        <div>
          <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>💡 Pro Tips</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Hover over (?) icons for helpful explanations</li>
            <li>Use the Help tab for detailed guides and construction terms</li>
            <li>Save your projects to come back later</li>
            <li>Export to PDF when ready to share</li>
          </ul>
          <p className="mt-3">Happy budgeting!</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
  ];

  return (
    <AuthProvider>
      {/* Tutorial */}
      <Joyride
        steps={tutorialSteps}
        run={runTutorial}
        continuous
        showProgress
        showSkipButton
        scrollToFirstStep
        disableScrolling={false}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#1B2D4F',
            zIndex: 10000,
          },
        }}
      />

      {/* Getting Started Modal */}
      {showGettingStarted && (
        <GettingStartedModal
          onClose={handleSkipGettingStarted}
          onStartTutorial={handleStartTutorial}
        />
      )}

      {/* Testing Phase Modal */}
      {showTestingModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTestingModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-[420px] overflow-y-auto"
            style={{ maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center p-6 sm:p-8">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 rounded-full p-3">
                  <FileWarning className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
                </div>
              </div>
              
              {/* Title */}
              <h2 className="text-lg sm:text-xl mb-4" style={{ fontWeight: 600, color: '#1B2D4F' }}>
                Preview Version Only
              </h2>
              
              {/* Description */}
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#4B5563' }}>
                This tool is still in development and <span style={{ color: '#DC2626', fontWeight: 500 }}>is not</span> intended for active project budgeting.
              </p>
              
              {/* Button */}
              <button 
                onClick={() => setShowTestingModal(false)}
                className="w-full rounded-md text-white transition-colors py-3 px-4"
                style={{ backgroundColor: '#1B2D4F', fontWeight: 500 }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15243d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1B2D4F'}
              >
                I Understand - Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background">
        {/* Persistent Testing Banner */}
        <div className="text-white py-2 px-4" style={{ backgroundColor: '#F7931E' }}>
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-sm md:text-base">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <p className="text-center">
              <strong>Preview version only.</strong> This tool is still in development and is not intended for active project budgeting.
            </p>
          </div>
        </div>

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
              <TabsTrigger 
                value="help"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0 pb-3 md:pb-4 text-sm md:text-base"
              >
                Help
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="projects" className="mt-0">
          <ProjectsTab refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="budget-builder" className="mt-0">
          <BudgetBuilderTab onProjectSaved={handleProjectSaved} resetForTutorial={resetBudgetBuilder} autoStartFromScratch={autoStartFromScratch} />
        </TabsContent>

        <TabsContent value="help" className="mt-0">
          <HelpTab onStartTutorial={handleStartTutorial} />
        </TabsContent>
      </Tabs>

        <Toaster />
      </div>
    </AuthProvider>
  );
}
