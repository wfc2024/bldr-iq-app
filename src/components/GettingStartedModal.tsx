import { X } from "lucide-react";

interface GettingStartedModalProps {
  onClose: () => void;
  onStartTutorial: () => void;
}

export function GettingStartedModal({ onClose, onStartTutorial }: GettingStartedModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <h2 className="text-xl sm:text-2xl" style={{ fontWeight: 600, color: '#1B2D4F' }}>
            Welcome to BLDR IQ
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          <p className="text-gray-600 text-sm sm:text-base">
            Create professional construction budgets in minutes, without needing to contact contractors for preliminary estimates.
          </p>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-3 sm:gap-4">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: '#F7931E' }}
              >
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Enter Project Details</h3>
                <p className="text-sm text-gray-600">
                  Start by filling in basic information like project name, location, and square footage.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: '#F7931E' }}
              >
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Add Line Items or Use a Template</h3>
                <p className="text-sm text-gray-600">
                  Select scopes of work from dropdowns with pre-loaded unit costs, or start with a pre-built template.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: '#F7931E' }}
              >
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Review Budget Breakdown</h3>
                <p className="text-sm text-gray-600">
                  See visual cost breakdowns, budget ranges, and benchmark comparisons automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: '#F7931E' }}
              >
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Save or Export</h3>
                <p className="text-sm text-gray-600">
                  Save your project for later or export a professional PDF to share with stakeholders.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Pro Tip:</strong> Hover over the (?) icons throughout the app to learn construction terminology and get helpful explanations.
            </p>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-md border-2 border-gray-300 hover:bg-gray-100 transition-colors"
            style={{ fontWeight: 500 }}
          >
            Skip Tutorial - Start Building
          </button>
          <button
            onClick={onStartTutorial}
            className="flex-1 px-4 py-3 rounded-md text-white transition-colors"
            style={{ backgroundColor: '#1B2D4F', fontWeight: 500 }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15243d'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1B2D4F'}
          >
            Take the Tour
          </button>
        </div>
      </div>
    </div>
  );
}
