import React from 'react';
import { motion } from 'framer-motion';

/**
 * Conteneur avec effet de transition pour les questions
 */
const QuestionTransition = ({ children, key }) => {
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default QuestionTransition;