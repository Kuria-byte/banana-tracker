import { calculateGrowthStage, getDaysFromPlanting, GROWTH_STAGE_THRESHOLDS } from '@/lib/utils/growth-utils';
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PlantLifecycleProps {
  plantedDate: string | Date;
  manualStage?: string;
}

const stages = [
  "Early Growth",
  "Vegetative",
  "Flower Emergence",
  "Bunch Formation",
  "Fruit Development",
  "Ready for Harvest"
];

// Stage colors mapped to shorter class names
const stageColors = {
  "Early Growth": "bg-blue-500",
  "Vegetative": "bg-teal-500",
  "Flower Emergence": "bg-indigo-500",
  "Bunch Formation": "bg-yellow-500",
  "Fruit Development": "bg-orange-500",
  "Ready for Harvest": "bg-red-500"
};

export function PlantLifecycle({ plantedDate, manualStage }: PlantLifecycleProps) {
  const date = typeof plantedDate === 'string' ? new Date(plantedDate) : plantedDate;
  const autoStage = calculateGrowthStage(date);
  const daysFromPlanting = getDaysFromPlanting(date);
  const currentStage = manualStage || autoStage;
  const stageIndex = stages.indexOf(currentStage);
  const progress = Math.min(100, (stageIndex / (stages.length - 1)) * 100);
  const stageColor = stageColors[currentStage] || "bg-gray-500";
  
  // Next stage calculation
  const nextStage = stageIndex < stages.length - 1 ? stages[stageIndex + 1] : null;
  
  // Generate unique ID for this component instance based on date
  const uniqueId = `plant-${date.getTime()}`;
  
  return (
    <div className="w-full">
      {/* CSS-only toggle implementation */}
      <div className="relative">
        <input 
          type="checkbox" 
          id={uniqueId} 
          className="peer sr-only" 
          aria-label="Show growth details"
        />
        
        {/* Compact view - always visible */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${stageColor}`}></div>
              <span className="font-medium truncate" title={currentStage}>
                {currentStage}
              </span>
            </div>
            
            {/* CSS-only toggle button */}
            <label 
              htmlFor={uniqueId}
              className="text-gray-500 hover:text-gray-700 transition-colors p-0.5 -mr-1 cursor-pointer"
            >
              <ChevronDown size={14} className="peer-checked:hidden" />
              <ChevronUp size={14} className="hidden peer-checked:block" />
            </label>
          </div>
          
          {/* Simple progress bar */}
          <div className="bg-gray-100 h-1.5 rounded-full overflow-hidden w-full">
            <div 
              className={`${stageColor} h-full rounded-full transition-all duration-300`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
        
        {/* Expanded details - visible when checkbox is checked */}
        <div className="hidden peer-checked:block text-xs space-y-2 pt-1 border-t border-gray-100 mt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500">Planted:</span>
              <div className="font-medium">{date.toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-gray-500">Age:</span>
              <div className="font-medium">{daysFromPlanting} days</div>
            </div>
          </div>
          
          {/* Stage progression */}
          <div className="pt-1">
            <div className="text-gray-500 mb-1">Growth stages:</div>
            <div className="space-y-1.5">
              {stages.map((stage, idx) => (
                <div key={stage} className="flex items-center">
                  <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                    idx < stageIndex ? stageColors[stage] : 
                    idx === stageIndex ? stageColors[stage] : 
                    'bg-gray-200'
                  }`}></div>
                  <div className={`text-xs ${
                    idx === stageIndex ? 'font-semibold' : 'text-gray-500'
                  }`}>
                    {stage}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Manual override notice */}
          {manualStage && (
            <div className="text-amber-600 pt-1">
              <span className="text-gray-500">Auto stage:</span> {autoStage}
            </div>
          )}
          
          {/* Action message */}
          <div className="pt-1 text-xs">
            {currentStage === "Ready for Harvest" ? (
              <div className="text-red-600 font-medium border border-red-100 rounded-sm p-1 bg-red-50 text-center">
                Ready to harvest!
              </div>
            ) : nextStage && (
              <div>
                <span className="text-gray-500">Next stage:</span>{" "}
                <span className="font-medium">{nextStage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}