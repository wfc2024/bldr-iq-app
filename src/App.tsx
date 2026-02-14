import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { BudgetBuilderTab } from "./components/BudgetBuilderTab";
import { ProjectsTab } from "./components/ProjectsTab";
import { HelpTab } from "./components/HelpTab";
import { GettingStartedModal } from "./components/GettingStartedModal";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserMenu } from "./components/UserMenu";
import { AuthForm } from "./components/AuthModal";
import { migrateProjectsData } from "./utils/dataMigration";
import { registerServiceWorker, setupInstallPrompt } from "./utils/registerServiceWorker";
import { AlertTriangle, FileWarning } from "lucide-react";
import bldriqLogo from "figma:asset/a2929011f50be4b54dd5c1378acb40f8b0742766.png";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { Button } from "./components/ui/button";

// Landing page shown to unauthenticated users
function LandingPage({ onShowAuth }: { onShowAuth: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Testing Banner */}
      <div className="text-white py-2 px-4" style={{ backgroundColor: '#F7931E' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-sm md:text-base">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <p className="text-center">
            <strong>Preview version only.</strong> This tool is still in development and is not intended for active project budgeting.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <img src={bldriqLogo} alt="BLDR IQ" className="h-8 md:h-10" />
              <div>
                <h1 className="text-xl md:text-2xl">Budget Builder</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '96px 24px 96px 24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '48px',
            fontWeight: 700, 
            color: '#1B2D4F', 
            marginBottom: '64px', 
            lineHeight: '1.2',
            padding: '0 16px'
          }}>
            Know in minutes, not weeks, if a deal is financially realistic.
          </h2>
          
          <p style={{ 
            fontSize: '20px',
            maxWidth: '896px', 
            margin: '0 auto',
            marginBottom: '64px',
            lineHeight: '1.625',
            padding: '0 16px',
            color: '#6B7280',
            fontWeight: 400
          }}>
            Built for brokers, bankers, and early decision-makers, BLDR IQ delivers early-stage TI cost insight so you can filter smarter from the start.
          </p>

          <div style={{ marginBottom: '96px', textAlign: 'center' }}>
            <Button 
              size="lg" 
              onClick={onShowAuth}
              style={{ 
                backgroundColor: '#1B2D4F',
                fontSize: '18px',
                padding: '28px 40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                height: 'auto'
              }}
            >
              <span>Get Started - Sign In or Sign Up</span>
              <span style={{
                fontSize: '14px',
                fontStyle: 'italic',
                fontWeight: 400,
                opacity: 0.9
              }}>
                for early cost clarity for commercial deals
              </span>
            </Button>
          </div>

          {/* Features */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            textAlign: 'left',
            padding: '0 16px'
          }}>
            <div style={{ padding: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 600, color: '#1B2D4F' }}>
                Pre-Built Templates
              </h3>
              <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: '1.625' }}>
                Choose from office, retail, or restaurant templates with common scopes of work already included.
              </p>
            </div>

            <div style={{ padding: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 600, color: '#1B2D4F' }}>
                Dropdown Selections
              </h3>
              <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: '1.625' }}>
                Minimal manual input required. Select from 69 construction line items organized into 14 categories.
              </p>
            </div>

            <div style={{ padding: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 600, color: '#1B2D4F' }}>
                Professional Reports
              </h3>
              <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: '1.625' }}>
                Export detailed budgets to PDF with cost breakdowns, charts, and benchmark comparisons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main app content (only shown when authenticated)
function AuthenticatedApp() {
  const [activeTab, setActiveTab] = useState("budget-builder");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showTestingModal, setShowTestingModal] = useState(true);
  const [showGettingStarted, setShowGettingStarted] = useState(false);
  const [runTutorial, setRunTutorial] = useState(false);
  const [resetBudgetBuilder, setResetBudgetBuilder] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [autoStartFromScratch, setAutoStartFromScratch] = useState(false);

  // Register PWA service worker
  useEffect(() => {
    registerServiceWorker();
    setupInstallPrompt();
  }, []);

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
    const { status } = data;
    
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
      target: '[data-tutorial="template-intro"]',
      content: (
        <div>
          <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Step 1: Choose Your Starting Point</h3>
          <p>You can start with a pre-built template or begin from scratch. Templates give you common line items for different project types.</p>
        </div>
      ),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[data-tutorial="template-cards"]',
      content: (
        <div>
          <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Step 2: Pre-Built Templates</h3>
          <p>Select from Office, Retail, or Restaurant templates. Each includes typical scopes of work for that project type with pre-filled quantities.</p>
        </div>
      ),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[data-tutorial="start-from-scratch"]',
      content: (
        <div>
          <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Step 3: Custom Budgets</h3>
          <p>Or click "Start From Scratch" to build a completely custom budget. You'll fill in project details and add only the line items you need.</p>
        </div>
      ),
      placement: "top",
      disableBeacon: true,
    },
    {
      target: "body",
      content: (
        <div>
          <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Step 4: What Comes Next</h3>
          <p>After choosing a template or starting from scratch, you'll fill in project details (name, address, square footage), add line items with quantities, and see your budget totals with helpful charts.</p>
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
    <>
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
                  <h1 
                    className="text-xl md:text-2xl cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setActiveTab("budget-builder")}
                    title="Go to Budget Builder"
                  >
                    Budget Builder
                  </h1>
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
    </>
  );
}

// Component that handles showing login or app based on auth state
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#1B2D4F' }}></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show landing page
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onShowAuth={() => setShowAuthModal(true)} />
        {showAuthModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6 lg:p-8"
            onClick={() => setShowAuthModal(false)}
          >
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-[90%] sm:max-w-md mx-auto" 
              style={{ maxWidth: '448px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <div className="flex justify-end p-2">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Auth modal content */}
              <div className="px-6 pb-6">
                <h2 className="text-xl sm:text-2xl mb-2" style={{ fontWeight: 600, color: '#1B2D4F' }}>
                  Welcome to BLDR IQ
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-6">
                  Sign in to save your projects and access them from anywhere
                </p>
                
                {/* We'll use the existing AuthModal component's form here */}
                <AuthForm />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // If authenticated, show the full app
  return <AuthenticatedApp />;
}

// Main App component
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
