"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  Wallet,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { IDoctorProfile } from "@/types/index";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const SPECIALIZATIONS = [
  "All",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Pediatrician",
  "Orthopedist",
  "Psychiatrist",
  "General Physician",
  "ENT Specialist",
  "Gynecologist",
];

const DoctorCard = ({ profile }: { profile: IDoctorProfile }) => (
  <Link
    href={`/doctors/${profile.user._id}`}
    className="group bg-white rounded-2xl p-5 flex gap-4 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
    style={{
      border: "1px solid #E5ECF4",
      boxShadow: "0 2px 8px rgba(13,27,42,0.04)",
    }}
  >
    {/* Avatar */}
    <div className="flex-shrink-0">
      {profile.user.avatar ? (
        <img
          src={profile.user.avatar}
          alt={profile.user.name}
          className="w-16 h-16 rounded-2xl object-cover"
        />
      ) : (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
          style={{ background: "linear-gradient(135deg,#1D6FA4,#22C9C9)" }}
        >
          {profile.user.name?.charAt(0)}
        </div>
      )}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3
            className="font-bold text-sm group-hover:text-[#1D6FA4] transition-colors"
            style={{ color: "#0D1B2A" }}
          >
            {profile.user.name}
          </h3>
          <p
            className="text-sm font-medium mt-0.5"
            style={{ color: "#1D6FA4" }}
          >
            {profile.specialization}
          </p>
        </div>
        <Badge variant="verified" />
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-2.5">
        <span
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: "#7A90A4" }}
        >
          <Clock size={11} style={{ color: "#C5D5E4" }} />
          {profile.experience} yrs exp
        </span>
        <span
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: "#7A90A4" }}
        >
          <Wallet size={11} style={{ color: "#C5D5E4" }} />₹
          {profile.consultationFee}
        </span>
        {profile.averageRating > 0 && (
          <span
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: "#D97706" }}
          >
            <Star size={11} fill="#F59E0B" color="#F59E0B" />
            {profile.averageRating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {profile.languages.slice(0, 3).map((lang) => (
          <span
            key={lang}
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: "#F7F9FC",
              color: "#3D5166",
              border: "1px solid #E5ECF4",
            }}
          >
            {lang}
          </span>
        ))}
      </div>
    </div>

    <ChevronRight
      size={17}
      className="self-center flex-shrink-0 transition-all group-hover:translate-x-0.5"
      style={{ color: "#C5D5E4" }}
    />
  </Link>
);

const SkeletonCard = () => (
  <div
    className="bg-white rounded-2xl p-5 flex gap-4"
    style={{ border: "1px solid #E5ECF4" }}
  >
    <div className="skeleton w-16 h-16 rounded-2xl flex-shrink-0" />
    <div className="flex-1 space-y-2.5">
      <div className="skeleton h-4 w-1/2 rounded-lg" />
      <div className="skeleton h-3 w-1/3 rounded-lg" />
      <div className="skeleton h-3 w-2/3 rounded-lg" />
    </div>
  </div>
);

export default function DoctorsPage() {
  const [profiles, setProfiles] = useState<IDoctorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [minFee, setMinFee] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input — only fire API after 400ms of inactivity
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "9" };
      if (debouncedSearch) params.name = debouncedSearch;
      if (specialization !== "All") params.specialization = specialization;
      if (minFee) params.minFee = minFee;
      if (maxFee) params.maxFee = maxFee;

      const res = await api.get("/doctors", { params });
      setProfiles(res.data.profiles);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, specialization, minFee, maxFee]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, specialization, minFee, maxFee]);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSpecialization("All");
    setMinFee("");
    setMaxFee("");
  };

  const hasActiveFilters =
    debouncedSearch || search || specialization !== "All" || minFee || maxFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "#0D1B2A", letterSpacing: "-0.03em" }}
        >
          Find a Doctor
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7A90A4" }}>
          {total > 0
            ? `${total} verified specialists available`
            : "Search from our verified specialists"}
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={15} />}
            rightIcon={
              search ? (
                <button
                  onClick={() => setSearch("")}
                  className="hover:text-[#1D6FA4] transition-colors"
                >
                  <X size={14} />
                </button>
              ) : undefined
            }
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border"
          style={{
            color: showFilters ? "#1D6FA4" : "#3D5166",
            borderColor: showFilters ? "#BAE6FD" : "#D9E4EE",
            background: showFilters ? "#E8F4FD" : "white",
          }}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span
              className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
              style={{ background: "#1D6FA4" }}
            >
              !
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[#F7F9FC]"
            style={{ color: "#7A90A4" }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div
          className="bg-white rounded-2xl p-6 mb-6 space-y-5 animate-fade-in"
          style={{
            border: "1px solid #E5ECF4",
            boxShadow: "0 4px 16px rgba(13,27,42,0.06)",
          }}
        >
          <div>
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: "#3D5166" }}
            >
              Specialization
            </p>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpecialization(s)}
                  className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: specialization === s ? "#1D6FA4" : "#F7F9FC",
                    color: specialization === s ? "white" : "#3D5166",
                    border: `1px solid ${specialization === s ? "#1D6FA4" : "#E5ECF4"}`,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: "#3D5166" }}
            >
              Consultation Fee (₹)
            </p>
            <div className="flex gap-3 items-center">
              <Input
                type="number"
                placeholder="Min fee"
                value={minFee}
                onChange={(e) => setMinFee(e.target.value)}
                className="max-w-[130px]"
              />
              <span className="text-sm" style={{ color: "#7A90A4" }}>
                to
              </span>
              <Input
                type="number"
                placeholder="Max fee"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                className="max-w-[130px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Specialization quick pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 mb-6"
        style={{ scrollbarWidth: "none" }}
      >
        {SPECIALIZATIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSpecialization(s)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: specialization === s ? "#1D6FA4" : "white",
              color: specialization === s ? "white" : "#3D5166",
              border: `1.5px solid ${specialization === s ? "#1D6FA4" : "#D9E4EE"}`,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Doctor grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : profiles.length === 0 ? (
          <div
            className="col-span-full bg-white rounded-2xl p-16 text-center"
            style={{ border: "1px solid #E5ECF4" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "#F7F9FC" }}
            >
              <Search size={28} style={{ color: "#C5D5E4" }} />
            </div>
            <p className="font-semibold" style={{ color: "#3D5166" }}>
              No doctors found
            </p>
            <p className="text-sm mt-1 mb-5" style={{ color: "#7A90A4" }}>
              Try adjusting your search or filters
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all border hover:bg-[#E8F4FD]"
                style={{ color: "#1D6FA4", borderColor: "#BAE6FD" }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          profiles.map((profile) => (
            <DoctorCard key={profile._id} profile={profile} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all border disabled:opacity-40"
            style={{
              color: "#3D5166",
              borderColor: "#D9E4EE",
              background: "white",
            }}
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-9 h-9 rounded-xl text-sm font-semibold transition-all border"
              style={{
                background: p === page ? "#1D6FA4" : "white",
                color: p === page ? "white" : "#3D5166",
                borderColor: p === page ? "#1D6FA4" : "#D9E4EE",
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all border disabled:opacity-40"
            style={{
              color: "#3D5166",
              borderColor: "#D9E4EE",
              background: "white",
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
