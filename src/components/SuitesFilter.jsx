import { SlidersHorizontal, RotateCcw } from "lucide-react";

export default function SuitesFilter({
  selectedType,
  onTypeChange,
  priceRange,
  onPriceChange,
  onReset,
  resultCount,
  roomTypes,
  minPrice,
  maxPrice,
}) {
  const [min, max] = priceRange;

  const handleMinChange = (value) => onPriceChange([Math.min(value, max), max]);
  const handleMaxChange = (value) => onPriceChange([min, Math.max(value, min)]);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-600" />
              Room Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="All">All Room Types</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Price Range / Night</span>
              <span className="font-serif text-sm font-semibold normal-case tracking-normal text-slate-800">
                ${min} &mdash; ${max}
              </span>
            </label>
            <div className="relative flex items-center gap-4 pt-1">
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step={10}
                value={min}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className="range-thumb-amber h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-amber-600"
              />
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step={10}
                value={max}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                className="range-thumb-amber h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-amber-600"
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-slate-400">
              <span>${minPrice}</span>
              <span>${maxPrice}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-amber-500 hover:text-amber-600"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
      <p className="mt-5 text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-800">{resultCount}</span>{" "}
        {resultCount === 1 ? "room" : "rooms"}
      </p>
    </div>
  );
}