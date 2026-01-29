"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  verified: boolean;
}

interface Claim {
  _id: string;
  status: string;
  createdAt: string;
  deal: {
    title: string;
    slug: string;
    partnerName: string;
    category: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchUserData(token);
    fetchClaims(token);
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  };

  const fetchClaims = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/claims/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClaims(data.claims);
      }
    } catch (error) {
      console.error("Failed to fetch claims", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-300";
      case "rejected":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-yellow-500/20 text-yellow-300";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Dashboard</h1>
              <p className="mt-2 text-lg text-zinc-400">
                Manage your profile and claimed deals.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full border border-white/20 px-6 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {user?.name}
              </h2>
              <p className="mt-1 text-zinc-400">{user?.email}</p>
              {user?.company && (
                <p className="mt-1 text-sm text-zinc-500">{user.company}</p>
              )}
            </div>
            <div>
              {user?.verified ? (
                <span className="flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-sm font-medium text-green-300">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-2 rounded-full bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-300">
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
                  Unverified
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Claimed Deals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-semibold text-white">Claimed Deals</h2>
          <p className="mt-1 text-zinc-400">
            Track the status of your claimed benefits.
          </p>

          {claims.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
              <svg
                className="mx-auto h-16 w-16 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="mt-4 text-lg text-zinc-400">
                You haven't claimed any deals yet.
              </p>
              <button
                onClick={() => router.push("/deals")}
                className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
              >
                Browse deals
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {claims.map((claim, idx) => (
                <motion.div
                  key={claim._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-white/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {claim.deal.title}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                            claim.status,
                          )}`}
                        >
                          {claim.status.charAt(0).toUpperCase() +
                            claim.status.slice(1)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">
                        {claim.deal.partnerName} · {claim.deal.category}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        Claimed on{" "}
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/deals/${claim.deal.slug}`)}
                      className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                    >
                      View deal
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
