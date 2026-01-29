"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface Company {
  _id: string;
  name: string;
  email: string;
  company: string;
  createdAt: string;
  verified: boolean;
}

interface Stats {
  totalStartups: number;
  verifiedStartups: number;
  pendingStartups: number;
  totalDeals: number;
  totalClaims: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.push("/login");
      return;
    }
    setToken(savedToken);
    fetchData(savedToken);
  }, [router]);

  const fetchData = async (authToken: string) => {
    try {
      const [statsRes, companiesRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/dashboard/stats", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch("http://localhost:5000/api/admin/companies/pending", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      if (!statsRes.ok || !companiesRes.ok) {
        router.push("/login");
        return;
      }

      const statsData = await statsRes.json();
      const companiesData = await companiesRes.json();

      setStats(statsData.stats);
      setPendingCompanies(companiesData.users);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId: string) => {
    setVerifying(userId);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/companies/${userId}/verify`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setPendingCompanies(pendingCompanies.filter((c) => c._id !== userId));
        if (stats) {
          setStats({
            ...stats,
            verifiedStartups: stats.verifiedStartups + 1,
            pendingStartups: stats.pendingStartups - 1,
          });
        }
      }
    } catch (error) {
      console.error("Failed to verify company:", error);
    } finally {
      setVerifying(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (confirm("Are you sure you want to reject this company?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/admin/companies/${userId}/reject`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          setPendingCompanies(pendingCompanies.filter((c) => c._id !== userId));
          if (stats) {
            setStats({
              ...stats,
              totalStartups: stats.totalStartups - 1,
              pendingStartups: stats.pendingStartups - 1,
            });
          }
        }
      } catch (error) {
        console.error("Failed to reject company:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">Manage startups & deals</p>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/admin/deals"
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition"
            >
              Manage Deals
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/login");
              }}
              className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
          >
            {[
              {
                label: "Total Startups",
                value: stats.totalStartups,
                color: "from-blue-500",
              },
              {
                label: "Verified",
                value: stats.verifiedStartups,
                color: "from-green-500",
              },
              {
                label: "Pending",
                value: stats.pendingStartups,
                color: "from-yellow-500",
              },
              {
                label: "Total Deals",
                value: stats.totalDeals,
                color: "from-purple-500",
              },
              {
                label: "Total Claims",
                value: stats.totalClaims,
                color: "from-pink-500",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`bg-gradient-to-br ${stat.color} to-transparent rounded-lg p-6 border border-white/10`}
              >
                <div className="text-zinc-400 text-sm mb-2">{stat.label}</div>
                <div className="text-4xl font-bold">{stat.value}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pending Companies */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <div className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">
              Pending Verification ({pendingCompanies.length})
            </h2>

            {pendingCompanies.length === 0 ? (
              <p className="text-zinc-400">No pending companies</p>
            ) : (
              <div className="space-y-4">
                {pendingCompanies.map((company) => (
                  <motion.div
                    key={company._id}
                    variants={itemVariants}
                    className="bg-zinc-800/50 border border-white/5 rounded-lg p-4 flex justify-between items-center hover:border-white/10 transition"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">
                        {company.company || company.name}
                      </h3>
                      <p className="text-zinc-400 text-sm">{company.email}</p>
                      <p className="text-zinc-500 text-xs mt-1">
                        Applied:{" "}
                        {new Date(company.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVerify(company._id)}
                        disabled={verifying === company._id}
                        className="px-4 py-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition disabled:opacity-50"
                      >
                        {verifying === company._id ? "Verifying..." : "Verify"}
                      </button>
                      <button
                        onClick={() => handleReject(company._id)}
                        disabled={verifying === company._id}
                        className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
