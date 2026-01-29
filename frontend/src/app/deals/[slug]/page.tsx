"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  eligibility: string;
  perks: string[];
  ctaText: string;
  claimInstructions: string;
}

export default function DealDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDeal();
  }, [params.slug]);

  const fetchDeal = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/deals/${params.slug}`,
      );
      const data = await response.json();
      setDeal(data.deal);
    } catch (error) {
      console.error("Failed to fetch deal", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setClaiming(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/claims/${deal?._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Deal claimed successfully! Check your dashboard.");
      } else {
        setMessage(data.message || "Failed to claim deal.");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6">
        <h1 className="text-2xl font-bold text-white">Deal not found</h1>
        <button
          onClick={() => router.push("/deals")}
          className="mt-4 text-blue-400 hover:text-blue-300"
        >
          Back to deals
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => router.push("/deals")}
            className="mb-6 flex items-center text-sm text-zinc-400 transition hover:text-white"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to deals
          </button>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-300">
                    {deal.category}
                  </span>
                  {deal.accessLevel === "locked" && (
                    <span className="flex items-center gap-1.5 rounded-full bg-orange-500/20 px-3 py-1 text-sm font-medium text-orange-300">
                      <svg
                        className="h-4 w-4"
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
                      Verification Required
                    </span>
                  )}
                </div>

                <h1 className="mt-4 text-3xl font-bold text-white md:text-4xl">
                  {deal.title}
                </h1>
                <p className="mt-2 text-lg text-zinc-400">{deal.partnerName}</p>
              </div>
            </div>

            <p className="mt-6 text-lg leading-relaxed text-zinc-300">
              {deal.description}
            </p>

            {deal.eligibility && (
              <div className="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                <h3 className="font-semibold text-blue-300">Eligibility</h3>
                <p className="mt-1 text-sm text-blue-200">{deal.eligibility}</p>
              </div>
            )}

            {deal.perks && deal.perks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white">
                  What's included
                </h3>
                <ul className="mt-3 space-y-2">
                  {deal.perks.map((perk, idx) => (
                    <li key={idx} className="flex items-start text-zinc-300">
                      <svg
                        className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {deal.claimInstructions && (
              <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
                <h3 className="font-semibold text-white">How to claim</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {deal.claimInstructions}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="rounded-full bg-white px-8 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-100 disabled:opacity-50"
              >
                {claiming ? "Claiming..." : deal.ctaText || "Claim deal"}
              </button>

              {message && (
                <p
                  className={`text-sm ${
                    message.includes("success")
                      ? "text-green-400"
                      : "text-orange-400"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
