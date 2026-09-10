import { useEffect, useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import PageHero from "../components/PageHero";
import SuitesFilter from "../components/SuitesFilter";
import RoomCard from "../components/RoomCard";
import Pagination from "../components/Pagination";
import { useRoomsData } from "../hooks/useRoomsData";

const PER_PAGE = 6;

export default function SuitesPage() {
  const { rooms, roomTypeNames, minPrice, maxPrice, isLoading, error } = useRoomsData();

  const [selectedType, setSelectedType] = useState("All");
  const [priceRange, setPriceRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const effectiveRange = priceRange ?? [minPrice, maxPrice];

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesType = selectedType === "All" || room.type === selectedType;
      const matchesPrice =
        room.pricePerNight >= effectiveRange[0] && room.pricePerNight <= effectiveRange[1];
      return matchesType && matchesPrice;
    });
  }, [rooms, selectedType, effectiveRange]);

  // Reset to page 1 whenever the filtered set changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, effectiveRange[0], effectiveRange[1]]);

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PER_PAGE));
  const pagedRooms = filteredRooms.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const handleReset = () => {
    setSelectedType("All");
    setPriceRange([minPrice, maxPrice]);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        {isLoading ? (
          <div className="py-20 text-center text-slate-500">Loading rooms…</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">
            Couldn't load rooms right now. Please try again later.
          </div>
        ) : (
          <>
            <SuitesFilter
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              priceRange={effectiveRange}
              onPriceChange={setPriceRange}
              onReset={handleReset}
              resultCount={filteredRooms.length}
              roomTypes={roomTypeNames}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />

            {pagedRooms.length > 0 ? (
              <>
                <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {pagedRooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
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
          </>
        )}
      </section>
    </div>
  );
}