import React from 'react';
import { Society } from '../types';
import { AiPriceEstimatorWidget } from '../components/estimator/AiPriceEstimatorWidget';

interface AiPriceEstimatorViewProps {
  societies: Society[];
}

export const AiPriceEstimatorView: React.FC<AiPriceEstimatorViewProps> = ({ societies }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AiPriceEstimatorWidget
        societies={societies}
      />
    </div>
  );
};
