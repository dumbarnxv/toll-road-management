export type VehicleType = 'car' | 'truck' | 'bike' | 'bus';

const baseFees: Record<VehicleType, number> = {
  bike: 1.0,
  car: 2.5,
  bus: 5.0,
  truck: 7.5,
};

const distanceMultiplier = 0.5; // $0.50 per km

export const calculateTollFee = (
  vehicleType: VehicleType,
  distance: number = 10 // default 10 km if not provided
): number => {
  const baseFee = baseFees[vehicleType] || baseFees.car;
  const distanceFee = distance * distanceMultiplier;
  const totalFee = baseFee + distanceFee;

  return Math.round(totalFee * 100) / 100; // Round to 2 decimal places
};
