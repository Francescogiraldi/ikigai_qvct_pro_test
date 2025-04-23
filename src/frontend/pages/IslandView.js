import React, { useState } from 'react';
import Logo from '../components/ui/Logo';
import Character from '../components/ui/Character';
import ProgressBar from '../components/ui/ProgressBar';
import ModuleCard from '../components/islands/ModuleCard';
import ModuleViewer from '../components/islands/ModuleViewer';
import Badge from '../components/ui/Badge';

const IslandView = ({ island, onReturn, globalProgress, onCompleteModule, modules }) => {
  const [activeModule, setActiveModule] = useState(null);
  
  // Get modules for this island
  const islandModules = modules.filter(m => m.islandId === island.id);
  
  // Check which modules are completed
  const completedModules = globalProgress?.completedModules || {};
  
  // Determine if a module is unlocked
  const isModuleUnlocked = (module, index) => {
    // First module is always unlocked
    if (index === 0) return true;
    
    // Check if previous module is completed
    const prevModule = islandModules[index - 1];
    return prevModule && completedModules[prevModule.id];
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <Logo />
          <button 
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors flex items-center"
            onClick={onReturn}
          >
            <span className="mr-2">←</span> Retour
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Island header */}
        <div className="text-center mb-8">
          <Character 
            character={island.mascot} 
            emotion="happy" 
            size="text-6xl" 
            className="mb-4"
          />
          <h1 className="text-3xl font-bold mb-2" style={{ color: island.color }}>
            {island.name}
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">{island.description}</p>
          
          {/* Island progress */}
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Progression</span>
              <span className="font-medium" style={{ color: island.color }}>
                {globalProgress?.islandProgress?.[island.id]?.progress || 0}%
              </span>
            </div>
            <ProgressBar 
              value={globalProgress?.islandProgress?.[island.id]?.progress || 0} 
              color={island.color} 
            />
            <div className="mt-2 text-xs text-center text-gray-500">
              {globalProgress?.islandProgress?.[island.id]?.completedModules || 0}/{island.modules} modules complétés
            </div>
          </div>
        </div>
        
        {/* Modules list */}
        <div>
          <h2 className="text-xl font-bold mb-4">Modules disponibles</h2>
          
          <div className="space-y-4 mb-8">
            {islandModules.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                isUnlocked={isModuleUnlocked(module, index)}
                isCompleted={!!completedModules[module.id]}
                color={island.color}
                onStart={() => setActiveModule(module)}
              />
            ))}
          </div>
        </div>
        
        {/* Badges section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Badges à débloquer</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(island.badges).map(badge => {
              const isBadgeEarned = globalProgress?.badges?.some(b => b.id === badge.id);
              
              return (
                <Badge
                  key={badge.id}
                  icon={badge.icon}
                  name={badge.name}
                  description={badge.description}
                  iconBgColor={isBadgeEarned ? "#FFC107" : "#e2e8f0"}
                />
              );
            })}
          </div>
        </div>
      </main>
      
      {/* Active module */}
      {activeModule && (
        <ModuleViewer
          module={activeModule}
          onClose={() => setActiveModule(null)}
          onComplete={onCompleteModule}
          isCompleted={!!completedModules[activeModule.id]}
          islandId={island.id}
          islandData={island}
        />
      )}
    </div>
  );
};

export default IslandView;