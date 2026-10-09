import React from 'react';
import { Society } from '../../types';
import { AiPriceEstimatorWidget } from '../../components/estimator/AiPriceEstimatorWidget';

interface StandalonePriceEstimatorViewProps {
  societies: Society[];
  onNavigate: (route: string) => void;
}

export const StandalonePriceEstimatorView: React.FC<StandalonePriceEstimatorViewProps> = ({
  societies,
  onNavigate
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AiPriceEstimatorWidget
        societies={societies}
        onNavigate={onNavigate}
      />
    </div>
  );
};
