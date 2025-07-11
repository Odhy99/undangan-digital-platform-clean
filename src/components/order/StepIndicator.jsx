import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <motion.div
              animate={currentStep >= step.id ? "active" : "inactive"}
              variants={{
                active: { scale: 1.1, backgroundColor: "#7c3aed", color: "#ffffff" },
                inactive: { scale: 1, backgroundColor: "#e5e7eb", color: "#4b5563" }
              }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
            >
              {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
            </motion.div>
            {index < steps.length - 1 && (
              <motion.div
                className="h-1 flex-1 bg-gray-200"
                animate={{ width: "100%" }}
              >
                <motion.div
                  className="h-1 bg-purple-600"
                  initial={{ width: "0%" }}
                  animate={{ width: currentStep > step.id ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="text-center mt-4">
        <h2 className="text-2xl font-bold mb-2">{steps[currentStep - 1].title}</h2>
        <p className="text-gray-600">{steps[currentStep - 1].description}</p>
      </div>
    </div>
  );
};

export default StepIndicator;