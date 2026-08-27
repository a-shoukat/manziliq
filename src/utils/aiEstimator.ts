import { PricePredictionInput, PricePredictionResult } from '../types';

export function calculateAIPriceEstimate(input: PricePredictionInput): PricePredictionResult {
  // Base rates in Housing Societies (PKR per Marla)
  let baseMarlaRate = 500000; // default 5 Lakh/Marla

  if (input.societyName.toLowerCase().includes('al-rehman')) {
    baseMarlaRate = 550000;
  } else if (input.societyName.toLowerCase().includes('model town')) {
    baseMarlaRate = 620000;
  } else if (input.societyName.toLowerCase().includes('royal orchard')) {
    baseMarlaRate = 490000;
  } else if (input.societyName.toLowerCase().includes('executive')) {
    baseMarlaRate = 420000;
  }

  // Type Multiplier
  let typeMultiplier = 1.0;
  if (input.propertyType === 'commercial_plot') typeMultiplier = 2.4;
  if (input.propertyType === 'constructed_house') typeMultiplier = 2.8;
  if (input.propertyType === 'plot_file') typeMultiplier = 0.75;

  // Location Category Multiplier
  let locMultiplier = 1.0;
  if (input.locationCategory === 'prime_main_road') locMultiplier = 1.35;
  if (input.locationCategory === 'corner_plot') locMultiplier = 1.15;
  if (input.locationCategory === 'park_facing') locMultiplier = 1.12;

  // Amenities boost
  const amenityBonus = (input.amenities.length || 0) * 25000;

  // Construction cost if house
  let constructionCost = 0;
  if (input.propertyType === 'constructed_house') {
    // approx 2200 PKR/sqft * 225 sqft per marla * area
    constructionCost = input.areaMarla * 225 * 2400 + (input.bedrooms * 200000) + (input.bathrooms * 150000);
  }

  const rawLandPrice = (input.areaMarla * baseMarlaRate * typeMultiplier * locMultiplier) + amenityBonus;
  const estimatedPricePKR = Math.round((rawLandPrice + constructionCost) / 10000) * 10000;

  const minPricePKR = Math.round(estimatedPricePKR * 0.93 / 10000) * 10000;
  const maxPricePKR = Math.round(estimatedPricePKR * 1.08 / 10000) * 10000;

  // Confidence Score calculation
  let confidenceScore = 92;
  if (input.propertyType === 'plot_file') confidenceScore = 84;
  if (input.areaMarla > 20) confidenceScore = 88;

  const factors = [
    {
      factor: `Base Rate for ${input.societyName || 'General Housing Market'}`,
      impact: 'positive' as const,
      percentage: `PKR ${(baseMarlaRate / 100000).toFixed(2)} Lakh / Marla`
    },
    {
      factor: `Property Type (${input.propertyType.replace('_', ' ').toUpperCase()})`,
      impact: typeMultiplier >= 1 ? ('positive' as const) : ('negative' as const),
      percentage: `${((typeMultiplier - 1) * 100).toFixed(0)}% adjustment`
    },
    {
      factor: `Location Position (${input.locationCategory.replace('_', ' ')})`,
      impact: locMultiplier > 1 ? ('positive' as const) : ('neutral' as const),
      percentage: locMultiplier > 1 ? `+${((locMultiplier - 1) * 100).toFixed(0)}% value premium` : 'Standard'
    },
    {
      factor: `${input.amenities.length} Selected Amenities`,
      impact: 'positive' as const,
      percentage: `+PKR ${(amenityBonus / 1000).toLocaleString()}k`
    }
  ];

  return {
    estimatedPricePKR,
    minPricePKR,
    maxPricePKR,
    confidenceScore,
    avgMarlaRatePKR: baseMarlaRate,
    influencingFactors: factors,
    marketDemand: input.societyName.includes('Al-Rehman') || input.societyName.includes('Model Town') ? 'Very High' : 'High'
  };
}
