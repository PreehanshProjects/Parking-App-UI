import React from "react";
import DateSelector from "../components/DateSelector";
import QuickBooking from "../components/QuickBooking";
import ParkingList from "../components/ParkingList";

function MainPage({
  spots,
  selectedDate,
  setSelectedDate,
  handleBooking,
  allBookings,
  userBookings,
  onQuickBookingResults,
}) {
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 px-6">
        <div className="flex-1">
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
        <div className="flex-1">
          <QuickBooking
            spots={spots}
            allBookings={allBookings}
            userBookings={userBookings}
            onBookingComplete={onQuickBookingResults}
          />
        </div>
      </div>
      <ParkingList spots={spots} onBook={handleBooking} />
    </>
  );
}

export default MainPage;
