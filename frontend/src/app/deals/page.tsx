"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Deal {
  _id: string;
  title: string;
  slug: string;
  description: string;
  partnerName: string;
  partnerLogoUrl: string;
  category: string;
  accessLevel: string;
  perks: string[];
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [accessLevel, setAccessLevel] = useState("");

  const categories = [
    "Cloud",
    "Analytics",
    "Sales",
    "Marketing",
    "Productivity",
  ];

  useEffect(() => {
    fetchDeals();
  }, [search, category, accessLevel]);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (accessLevel) params.append("accessLevel", accessLevel);

      const response = await fetch(
        `http://localhost:5000/api/deals?${params.toString()}`,
      );
      const data = await response.json();
      setDeals(data.deals || []);
    } catch (error) {
      console.error("Failed to fetch deals", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            Explore Deals
          </h1>
          <p className="mt-3 text-lg text-zinc-400">
            Discover exclusive perks from our partner network.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur md:flex-row md:items-center"
        >
          <input
            type="text"
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-white/10 bg-zinc-900 px-4 py-2.5 text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value)}
            className="rounded-lg border border-white/10 bg-zinc-900 px-4 py-2.5 text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Access</option>
            <option value="public">Public</option>
            <option value="locked">Locked</option>
          </select>
        </motion.div>

        {/* Deals Grid */}
        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-white/5"
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {deals.map((deal, idx) => (
              <motion.div
                key={deal._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Link
                  href={`/deals/${deal.slug}`}
                  className="group block h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-400">
                          {deal.category}
                        </span>
                        {deal.accessLevel === "locked" && (
                          <span className="flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-300">
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            Locked
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 text-xl font-semibold text-white group-hover:text-blue-400">
                        {deal.title}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-400">
                        {deal.partnerName}
                      </p>
                      <p className="mt-3 line-clamp-2 text-sm text-zinc-300">
                        {deal.description}
                      </p>
                    </div>
                  </div>

                  {deal.perks && deal.perks.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {deal.perks.slice(0, 2).map((perk, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300"
                        >
                          {perk}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-center text-sm font-medium text-blue-400 transition group-hover:text-blue-300">
                    View details
                    <svg
                      className="ml-1 h-4 w-4 transition group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && deals.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-lg text-zinc-400">
              No deals found. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
