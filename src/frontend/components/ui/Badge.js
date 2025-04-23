import React from 'react';
import { motion } from 'framer-motion';

const Badge = ({ icon, name, description, color = "#FFF3E0", iconBgColor = "#41D185" }) => (
  <motion.div 
    className="flex items-center p-3 rounded-xl bg-white border-2 border-gray-100 shadow-sm"
    whileHover={{ scale: 1.05 }}
  >
    <div className="rounded-full w-12 h-12 flex items-center justify-center text-xl mr-3 text-white" style={{ backgroundColor: iconBgColor }}>
      <span>{icon}</span>
    </div>
    <div>
      <div className="font-bold text-sm">{name}</div>
      {description && (
        <div className="text-xs text-gray-500" style={{ maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={description}>
          {description}
        </div>
      )}
    </div>
  </motion.div>
);

export default Badge;