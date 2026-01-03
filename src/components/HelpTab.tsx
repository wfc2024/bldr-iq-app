import { BookOpen, Play, HelpCircle, FileText, Lightbulb } from "lucide-react";
import { HelpTooltip } from "./HelpTooltip";

interface HelpTabProps {
  onStartTutorial: () => void;
}

export function HelpTab({ onStartTutorial }: HelpTabProps) {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl mb-2" style={{ fontWeight: 600, color: '#1B2D4F' }}>
          Help Center
        </h2>
        <p className="text-gray-600">
          Everything you need to know to create professional construction budgets
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={onStartTutorial}
          className="flex items-center gap-4 p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-all text-left"
        >
          <div 
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#F7931E' }}
          >
            <Play className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Start Interactive Tutorial</h3>
            <p className="text-sm text-gray-600">
              Take a guided tour of the Budget Builder
            </p>
          </div>
        </button>

        <div className="flex items-center gap-4 p-6 bg-white border-2 border-gray-200 rounded-lg">
          <div 
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-gray-100"
          >
            <FileText className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Demo Project</h3>
            <p className="text-sm text-gray-600">
              Explore a sample office tenant improvement budget (Coming Soon)
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5" style={{ color: '#1B2D4F' }} />
          <h3 className="text-xl" style={{ fontWeight: 600, color: '#1B2D4F' }}>
            Quick Start Guide
          </h3>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Step 1: Create a New Budget</h4>
            <p className="text-sm text-gray-600 mb-2">
              Navigate to the <strong>Budget BLDR</strong> tab and fill in your project details:
            </p>
            <ul className="text-sm text-gray-600 ml-6 space-y-1 list-disc">
              <li>Project Name - A descriptive name for your project</li>
              <li>Location - City and state (affects labor costs)</li>
              <li>Square Footage - Total area of your project</li>
              <li>Project Type - Residential or Commercial</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Step 2: Add Line Items</h4>
            <p className="text-sm text-gray-600 mb-2">
              You have three options to build your budget:
            </p>
            <ul className="text-sm text-gray-600 ml-6 space-y-1 list-disc">
              <li><strong>Use a Template</strong> - Start with pre-built budgets for common projects</li>
              <li><strong>Add Individual Line Items</strong> - Select categories and scopes from dropdowns</li>
              <li><strong>Add Assembly Packages</strong> - Add multiple related items at once</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Step 3: Customize Your Budget</h4>
            <p className="text-sm text-gray-600 mb-2">
              Fine-tune each line item:
            </p>
            <ul className="text-sm text-gray-600 ml-6 space-y-1 list-disc">
              <li>Adjust quantities to match your project scope</li>
              <li>Enable custom inputs to override unit costs</li>
              <li>Add General Contractor markup (OH&P)</li>
              <li>Duplicate line items for similar scopes</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Step 4: Review & Export</h4>
            <p className="text-sm text-gray-600 mb-2">
              Analyze your budget and share it:
            </p>
            <ul className="text-sm text-gray-600 ml-6 space-y-1 list-disc">
              <li>View pie charts showing cost breakdown by category</li>
              <li>See budget ranges (optimistic, realistic, pessimistic)</li>
              <li>Compare against industry benchmarks</li>
              <li>Export a professional PDF or save for later</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Construction Terms Glossary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5" style={{ color: '#1B2D4F' }} />
          <h3 className="text-xl" style={{ fontWeight: 600, color: '#1B2D4F' }}>
            Common Construction Terms
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">General Contractor (GC) Overhead & Profit</h4>
            <p className="text-sm text-gray-600">
              The percentage markup a general contractor adds to cover business costs and profit margin. Typically 10-20%.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Scope of Work</h4>
            <p className="text-sm text-gray-600">
              A specific task or category of construction work, like "Drywall Installation" or "Electrical Rough-In."
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Unit Cost</h4>
            <p className="text-sm text-gray-600">
              The price per unit of measurement (per SF, LF, EA, etc.) that includes labor and materials.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Assembly Package</h4>
            <p className="text-sm text-gray-600">
              A bundle of related line items that are commonly done together, like all items needed for a conference room or restroom build-out.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Budget Range</h4>
            <p className="text-sm text-gray-600">
              Three scenarios showing optimistic (-15%), realistic, and pessimistic (+15%) cost projections.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Benchmark Comparison</h4>
            <p className="text-sm text-gray-600">
              How your budget compares to industry-standard costs per square foot for similar projects.
            </p>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5" style={{ color: '#1B2D4F' }} />
          <h3 className="text-xl" style={{ fontWeight: 600, color: '#1B2D4F' }}>
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">How accurate are these budget estimates?</h4>
            <p className="text-sm text-gray-600">
              Our unit costs are based on industry data and provide realistic preliminary estimates. However, actual costs vary by location, market conditions, and specific project requirements. Always get formal quotes from contractors for final budgets.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Can I customize the unit costs?</h4>
            <p className="text-sm text-gray-600">
              Yes! Enable "Custom Input" on any line item to override the default unit cost with your own pricing.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-1">What's the difference between templates and assemblies?</h4>
            <p className="text-sm text-gray-600">
              Templates provide a complete starting point for common project types (like "Office Tenant Improvement"), while assemblies are smaller packages of related items you can add to any budget (like "Conference Room Package").
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Where is my data stored?</h4>
            <p className="text-sm text-gray-600">
              Currently, all projects are saved locally in your browser. They won't sync across devices and will be lost if you clear your browser data. Cloud storage with user accounts is coming soon.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Can I share my budgets with others?</h4>
            <p className="text-sm text-gray-600">
              Yes! Use the "Export PDF" feature to create a professional document you can email or share with contractors, clients, or stakeholders.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-1">What if I can't find the scope of work I need?</h4>
            <p className="text-sm text-gray-600">
              Use the "Custom Line Item" feature to add any scope not in our database. You can specify your own description, unit of measure, quantity, and unit cost.
            </p>
          </div>
        </div>
      </div>

      {/* Tips & Best Practices */}
      <div 
        className="border-2 rounded-lg p-6"
        style={{ backgroundColor: '#FFF7ED', borderColor: '#F7931E' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5" style={{ color: '#F7931E' }} />
          <h3 className="text-xl" style={{ fontWeight: 600, color: '#1B2D4F' }}>
            Tips & Best Practices
          </h3>
        </div>

        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span style={{ color: '#F7931E' }}>•</span>
            <span><strong>Start with a template</strong> if you're working on a common project type - you can always modify it.</span>
          </li>
          <li className="flex gap-2">
            <span style={{ color: '#F7931E' }}>•</span>
            <span><strong>Add 10-20% contingency</strong> to your total budget for unexpected costs.</span>
          </li>
          <li className="flex gap-2">
            <span style={{ color: '#F7931E' }}>•</span>
            <span><strong>Save your project regularly</strong> to avoid losing work (auto-save coming soon).</span>
          </li>
          <li className="flex gap-2">
            <span style={{ color: '#F7931E' }}>•</span>
            <span><strong>Use the budget range feature</strong> to understand best-case and worst-case scenarios.</span>
          </li>
          <li className="flex gap-2">
            <span style={{ color: '#F7931E' }}>•</span>
            <span><strong>Review the pie chart</strong> to identify which categories are driving your costs.</span>
          </li>
          <li className="flex gap-2">
            <span style={{ color: '#F7931E' }}>•</span>
            <span><strong>Hover over (?) icons</strong> throughout the app for helpful explanations and construction terminology.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
