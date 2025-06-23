/* eslint-disable no-unused-vars */
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Chip,
} from "@material-tailwind/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

function ParkingCard({ spot, onBook }) {
  const isBooked = spot.booked;

  const imageSrc =
    spot.type === "outside"
      ? "/images/outside.jpg"
      : spot.type === "underground"
      ? "/images/underground.jpg"
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.03,
        rotateX: 1.5,
        rotateY: 1.5,
        boxShadow: "0 12px 25px rgba(0, 0, 0, 0.08)",
      }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      className="w-full sm:w-80 mx-auto"
    >
      <Card
        className={`relative h-full flex flex-col justify-between rounded-2xl overflow-hidden shadow-md transition-all border border-gray-200 bg-white/70 backdrop-blur-md ${
          !isBooked
            ? "hover:ring-1 hover:ring-blue-300 hover:border-blue-300"
            : ""
        }`}
      >
        {imageSrc && (
          <div className="overflow-hidden">
            <img
              src={imageSrc}
              alt={`${spot.type} parking`}
              loading="lazy"
              className="w-full h-36 object-cover transition-transform duration-300 hover:scale-105 rounded-t-2xl"
            />
          </div>
        )}

        <CardBody className="flex flex-col gap-4 flex-grow p-5 text-black">
          <div className="flex justify-between items-center">
            <Typography variant="h6" className="font-bold text-gray-900">
              Parking #{spot.id}
            </Typography>
            {!isBooked ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-400" />
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPinIcon className="h-5 w-5 text-blue-400" />
            <span>{spot.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDaysIcon className="h-5 w-5 text-purple-400" />
            <span className="capitalize">
              {spot.type === "underground" ? "Underground" : "Outdoor"} spot
            </span>
          </div>

          {isBooked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-2"
            >
              <Chip
                value="Booked"
                size="sm"
                className="bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-full"
              />
            </motion.div>
          )}

          <div className="flex-grow" />
        </CardBody>

        <CardFooter className="pt-0 px-5 pb-5 mt-auto">
          <Button
            fullWidth
            disabled={isBooked}
            onClick={() => onBook(spot.id)}
            className={`text-white text-sm py-2 px-4 rounded-full transition-all duration-300 ease-in-out ${
              isBooked
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-blue-500 hover:to-purple-600 shadow-md"
            }`}
          >
            {isBooked ? "Booked" : "Book Spot"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default ParkingCard;
