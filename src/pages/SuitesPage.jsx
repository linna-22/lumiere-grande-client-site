import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import PageHero from "../components/PageHero";
import SuitesFilter from "../components/SuitesFilter";
import RoomCard from "../components/RoomCard";
import { rooms, MIN_PRICE, MAX_PRICE } from "../data/rooms";

export default function SuitesPage() {
  const [selectedType, setSelectedType] = useState("All");
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesType = selectedType === "All" || room.type === selectedType;
      const matchesPrice =
        room.pricePerNight >= priceRange[0] && room.pricePerNight <= priceRange[1];
      return matchesType && matchesPrice;
    });
  }, [selectedType, priceRange]);

  const handleReset = () => {
    setSelectedType("All");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
  };

  return (
    <div>
      <PageHero
        eyebrow="Accommodations"
        title="Suites & Rooms"
        description="Discover a curated collection of rooms and suites, each designed to deliver an unforgettable stay — from cozy deluxe rooms to our grand presidential suite."
        image="https://images.pexels.com/photos/14012687/pexels-photo-14012687.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1600"
      />

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <SuitesFilter
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          onReset={handleReset}
          resultCount={filteredRooms.length}
        />

        {filteredRooms.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 py-20 text-center">
            <SearchX className="h-12 w-12 text-slate-300" />
            <h3 className="font-serif text-xl text-slate-800">No rooms match your filters</h3>
            <p className="max-w-sm text-sm text-slate-500">
              Try adjusting the room type or price range to see more of our beautiful
              accommodations.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
