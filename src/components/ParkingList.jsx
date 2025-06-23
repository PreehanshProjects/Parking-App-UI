// src/components/ParkingList.jsx
import ParkingCard from "./ParkingCard";

function ParkingList({ spots, onBook }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-10">
      {spots.map((spot) => (
        <ParkingCard key={spot.id} spot={spot} onBook={onBook} />
      ))}
    </div>
  );
}

export default ParkingList;
