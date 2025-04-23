import React from 'react';
import { motion } from 'framer-motion';

const ExerciseModal = ({ exercise, onClose }) => {
  if (!exercise) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-5">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2 text-2xl">⚡</span>
            Exercice Rapide: {exercise.title}
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            Préparez-vous pour un exercice de <span className="font-semibold">{exercise.duration}</span> axé sur la <span className="font-semibold">{exercise.title.toLowerCase()}</span>.
          </p>
          <p className="text-sm text-gray-500">
            Cette fonctionnalité sera pleinement implémentée dans une future version pour vous guider à travers l'exercice.
          </p>
        </div>
        <div className="p-4 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ExerciseModal;