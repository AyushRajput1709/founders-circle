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

interface Activity {
  type: "registration" | "claim";
  user: { name: string; email: string; company: string };
  deal?: { title: string; category: string };
  verified?: boolean;
  status?: string;
  timestamp: string;
}

interface DealPerformance {
  dealTitle: string;
  claimCount: number;
  category: string;
}

export default function EnhancedAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [popularDeals, setPopularDeals] = useState<DealPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.push("/login");
      return;
    }
    setToken(savedToken);
    verifyAdminAccess(savedToken);
  }, [router]);

  const verifyAdminAccess = async (authToken: string) => {
    try {
      // First verify the user is an admin
      const userRes = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!userRes.ok) {
        router.push("/login");
        return;
      }

      const userData = await userRes.json();
      
      // Redirect non-admins to customer dashboard
      if (userData.user?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      // If admin, fetch admin data
      fetchData(authToken);
    } catch (error) {
      console.error("Failed to verify admin access:", error);
      router.push("/login");
    }
  };

  const fetchData = async (authToken: string) => {
    try {
      const [statsRes, companiesRes, activityRes, analyticsRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/dashboard/stats", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch("http://localhost:5000/api/admin/companies/pending", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch("http://localhost:5000/api/admin/activity?limit=10", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch("http://localhost:5000/api/admin/analytics", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      if (!statsRes.ok || !companiesRes.ok) {
        router.push("/login");
        return;
      }

      const statsData = await statsRes.json();
      const companiesData = await companiesRes.json();
      const activityData = await activityRes.json();
      const analyticsData = await analyticsRes.json();

      setStats(statsData.stats);
      setPendingCompanies(companiesData.users);
      setRecentActivity(activityData.activities || []);
      setPopularDeals(analyticsData.popularDeals || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId: string) => {
    setVerifying(userId);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/companies/${userId}/verify`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const handleBulkVerify = async () => {
    if (selectedCompanies.length === 0) {
      alert("Please select companies to verify");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/admin/companies/bulk-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: selectedCompanies }),
      });

      if (response.ok) {
        setPendingCompanies(pendingCompanies.filter((c) => !selectedCompanies.includes(c._id)));
        setSelectedCompanies([]);
        if (stats) {
          setStats({
            ...stats,
            verifiedStartups: stats.verifiedStartups + selectedCompanies.length,
            pendingStartups: stats.pendingStartups - selectedCompanies.length,
          });
        }
        alert(`${selectedCompanies.length} companies verified successfully!`);
      }
    } catch (error) {
      console.error("Failed to bulk verify:", error);
    }
  };

  const handleReject = async (userId: string) => {
    if (confirm("Are you sure you want to reject this company?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/companies/${userId}/reject`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

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

  const handleExport = async (type: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/export?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-export.csv`;
      a.click();
    } catch (error) {
      console.error("Failed to export:", error);
    }
  };

  const toggleCompanySelection = (companyId: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId]
    );
  };

  const filteredCompanies = pendingCompanies.filter(
    (c) =>
      c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Loading admin dashboard...</div>
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
              🛡️ Admin Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">Comprehensive platform management</p>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/admin/deals"
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition"
            >
              Manage Deals
            </Link>
            <button
              onClick={() => handleExport("users")}
              className="px-4 py-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition"
            >
              📥 Export
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition"
            >
              Home
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
              { label: "Total Startups", value: stats.totalStartups, color: "from-blue-500", icon: "👥" },
              { label: "Verified", value: stats.verifiedStartups, color: "from-green-500", icon: "✅" },
              { label: "Pending", value: stats.pendingStartups, color: "from-yellow-500", icon: "⏳" },
              { label: "Total Deals", value: stats.totalDeals, color: "from-purple-500", icon: "🎁" },
              { label: "Total Claims", value: stats.totalClaims, color: "from-pink-500", icon: "📊" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`bg-gradient-to-br ${stat.color} to-transparent rounded-lg p-6 border border-white/10`}
              >
                <div className="text-zinc-400 text-sm mb-2">{stat.icon} {stat.label}</div>
                <div className="text-4xl font-bold">{stat.value}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Popular Deals */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-1">
            <div className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                🔥 Top Deals
              </h2>
              {popularDeals.length === 0 ? (
                <p className="text-zinc-400 text-sm">No deals claimed yet</p>
              ) : (
                <div className="space-y-3">
                  {popularDeals.map((deal, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-zinc-800/50 rounded hover:bg-zinc-800 transition">
                      <div>
                        <div className="font-semibold text-sm">{deal.dealTitle}</div>
                        <div className="text-zinc-400 text-xs">{deal.category}</div>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">{deal.claimCount}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-2">
            <div className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                📈 Recent Activity
              </h2>
              {recentActivity.length === 0 ? (
                <p className="text-zinc-400 text-sm">No recent activity</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentActivity.map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-zinc-800/30 rounded hover:bg-zinc-800/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.type === "registration" ? "bg-blue-400" : "bg-green-400"
                          }`}
                        ></div>
                        <div>
                          <div className="text-sm font-medium">
                            {activity.type === "registration" ? (
                              <>
                                <span className="text-blue-400">New Registration:</span> {activity.user.name}
                              </>
                            ) : (
                              <>
                                <span className="text-green-400">Deal Claimed:</span> {activity.deal?.title}
                              </>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {activity.user.email} • {new Date(activity.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {activity.type === "registration" && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            activity.verified
                              ? "bg-green-600/20 text-green-400"
                              : "bg-yellow-600/20 text-yellow-400"
                          }`}
                        >
                          {activity.verified ? "Verified" : "Pending"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Pending Companies */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <div className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">⏳ Pending Verification ({filteredCompanies.length})</h2>
              <div className="flex gap-3">
                {selectedCompanies.length > 0 && (
                  <button
                    onClick={handleBulkVerify}
                    className="px-4 py-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition font-semibold"
                  >
                    ✅ Verify Selected ({selectedCompanies.length})
                  </button>
                )}
                <input
                  type="text"
                  placeholder="🔍 Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 border border-white/10 text-white placeholder-zinc-500"
                />
              </div>
            </div>

            {filteredCompanies.length === 0 ? (
              <p className="text-zinc-400">No pending companies</p>
            ) : (
              <div className="space-y-4">
                {filteredCompanies.map((company) => (
                  <motion.div
                    key={company._id}
                    variants={itemVariants}
                    className="bg-zinc-800/50 border border-white/5 rounded-lg p-4 flex justify-between items-center hover:border-white/10 transition"
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company._id)}
                        onChange={() => toggleCompanySelection(company._id)}
                        className="w-5 h-5 rounded bg-zinc-700 border-zinc-600 cursor-pointer"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{company.company || company.name}</h3>
                        <p className="text-zinc-400 text-sm">{company.email}</p>
                        <p className="text-zinc-500 text-xs mt-1">
                          Applied: {new Date(company.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVerify(company._id)}
                        disabled={verifying === company._id}
                        className="px-4 py-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition disabled:opacity-50"
                      >
                        {verifying === company._id ? "Verifying..." : "✅ Verify"}
                      </button>
                      <button
                        onClick={() => handleReject(company._id)}
                        disabled={verifying === company._id}
                        className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition disabled:opacity-50"
                      >
                        ❌ Reject
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
