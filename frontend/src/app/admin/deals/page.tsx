"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface Deal {
  _id: string;
  title: string;
  slug: string;
  category: string;
  accessLevel: string;
  createdAt: string;
}

interface FormData {
  title: string;
  slug: string;
  description: string;
  partnerName: string;
  category: string;
  accessLevel: string;
  perks: string;
  ctaText: string;
}

export default function AdminDeals() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    slug: "",
    description: "",
    partnerName: "",
    category: "Cloud",
    accessLevel: "public",
    perks: "",
    ctaText: "Claim deal",
  });

  const categories = [
    "Cloud",
    "Analytics",
    "Sales",
    "Marketing",
    "Productivity",
  ];
  const accessLevels = ["public", "locked"];

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.push("/login");
      return;
    }
    setToken(savedToken);
    fetchDeals(savedToken);
  }, [router]);

  const fetchDeals = async (authToken: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/deals", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      setDeals(data.deals);
    } catch (error) {
      console.error("Failed to fetch deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          perks: formData.perks.split(",").map((p) => p.trim()),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDeals([data.deal, ...deals]);
        setFormData({
          title: "",
          slug: "",
          description: "",
          partnerName: "",
          category: "Cloud",
          accessLevel: "public",
          perks: "",
          ctaText: "Claim deal",
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to create deal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (confirm("Are you sure you want to delete this deal?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/admin/deals/${dealId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          setDeals(deals.filter((d) => d._id !== dealId));
        }
      } catch (error) {
        console.error("Failed to delete deal:", error);
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
              Manage Deals
            </h1>
            <p className="text-zinc-400 mt-1">
              Create and manage exclusive deals
            </p>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition"
            >
              Back to Dashboard
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
        {/* Create Deal Form */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 px-6 py-3 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition font-semibold"
          >
            + Create New Deal
          </button>
        ) : (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Create New Deal</h2>
            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Deal Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="bg-zinc-800 border border-white/10 rounded px-4 py-2 text-white placeholder-zinc-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Slug (url-friendly)"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="bg-zinc-800 border border-white/10 rounded px-4 py-2 text-white placeholder-zinc-500"
                  required
                />
              </div>

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-zinc-800 border border-white/10 rounded px-4 py-2 text-white placeholder-zinc-500"
                rows={3}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Partner Name"
                  value={formData.partnerName}
                  onChange={(e) =>
                    setFormData({ ...formData, partnerName: e.target.value })
                  }
                  className="bg-zinc-800 border border-white/10 rounded px-4 py-2 text-white placeholder-zinc-500"
                  required
                />
                <input
                  type="text"
                  placeholder="CTA Text"
                  value={formData.ctaText}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaText: e.target.value })
                  }
                  className="bg-zinc-800 border border-white/10 rounded px-4 py-2 text-white placeholder-zinc-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="bg-zinc-800 border border-white/10 rounded px-4 py-2 text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.accessLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, accessLevel: e.target.value })
                  }
                  className="bg-zinc-800 border border-white/10 rounded px-4 py-2 text-white"
                >
                  {accessLevels.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Perks (comma-separated)"
                value={formData.perks}
                onChange={(e) =>
                  setFormData({ ...formData, perks: e.target.value })
                }
                className="w-full bg-zinc-800 border border-white/10 rounded px-4 py-2 text-white placeholder-zinc-500"
              />

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Deal"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Deals List */}
        <div className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">
            All Deals ({deals.length})
          </h2>

          {deals.length === 0 ? (
            <p className="text-zinc-400">No deals created yet</p>
          ) : (
            <div className="space-y-4">
              {deals.map((deal) => (
                <motion.div
                  key={deal._id}
                  variants={itemVariants}
                  className="bg-zinc-800/50 border border-white/5 rounded-lg p-4 flex justify-between items-center hover:border-white/10 transition"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{deal.title}</h3>
                    <p className="text-zinc-400 text-sm">
                      {deal.category} • {deal.accessLevel}
                    </p>
                    <p className="text-zinc-500 text-xs mt-1">
                      Created: {new Date(deal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDeal(deal._id)}
                    className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
                  >
                    Delete
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
