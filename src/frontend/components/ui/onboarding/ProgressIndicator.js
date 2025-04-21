import React from 'react';
import { motion } from 'framer-motion';

/**
 * Indicateur de progression avec animation
 */
const ProgressIndicator = ({ steps, currentStep, colors }) => {
  return (
    <div className="relative mb-6">
      {/* Ligne de fond avec effet de brillance */}
      <div className="h-2 bg-gray-100 rounded-full w-full absolute top-1/2 transform -translate-y-1/2 overflow-hidden shadow-inner">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
            width: "50%"
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
        />
      </div>
      
      {/* Points et segments colorés */}
      <div className="flex justify-between relative">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center relative z-10">
            {/* Point de progression */}
            <motion.div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: index <= currentStep ? colors[index % colors.length] : 'white',
                border: index <= currentStep ? 'none' : '2px solid #e5e5e5',
                zIndex: 20
              }}
              animate={{ 
                scale: index === currentStep ? [1, 1.2, 1] : 1,
                boxShadow: index <= currentStep 
                  ? `0 0 12px ${colors[index % colors.length]}80` 
                  : "none"
              }}
              transition={{ 
                repeat: index === currentStep ? Infinity : 0,
                repeatType: "mirror",
                duration: 2,
                repeatDelay: 1,
              }}
            >
              {index < currentStep ? (
                <motion.span 
                  className="text-white text-[12px]"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  ✓
                </motion.span>
              ) : index === currentStep ? (
                <motion.span 
                  className="text-white text-[12px]"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5
                  }}
                >
                  •
                </motion.span>
              ) : null}
            </motion.div>
            
            {/* Ligne de progression entre les points avec animation */}
            {index < steps.length - 1 && (
              <motion.div 
                className="h-1.5 rounded-full absolute left-6"
                style={{ 
                  background: index < currentStep 
                    ? `linear-gradient(90deg, ${colors[index % colors.length]}, ${colors[(index + 1) % colors.length]})` 
                    : '#e5e5e5',
                  width: "calc(100% - 1.5rem)",
                  right: 0,
                  zIndex: 10,
                  overflow: "hidden"
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: index < currentStep ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Animation de flux pour les étapes complétées */}
                {index < currentStep && (
                  <motion.div
                    className="absolute inset-0 opacity-50"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                      width: "30%"
                    }}
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                  />
                )}
              </motion.div>
            )}
          </div>
        ))}
      </div>
      
      {/* Étiquettes optionnelles sous les points */}
      <div className="flex justify-between text-xs text-gray-500 mt-2 px-1.5">
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index <= currentStep ? 1 : 0.5,
              color: index === currentStep ? colors[index % colors.length] : undefined,
              fontWeight: index === currentStep ? 500 : 400
            }}
            className="w-8 text-center overflow-hidden"
            style={{ maxWidth: "60px" }}
          >
            <span className="truncate block text-center">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;