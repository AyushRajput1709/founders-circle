"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AnimatedHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-24 md:py-32">
      {/* Background glow effects */}
      <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-5xl text-center"
      >
        <motion.div variants={itemVariants}>
          <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300">
            Built for Founders
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mt-8 text-5xl font-bold leading-tight tracking-tight md:text-7xl"
        >
          Premium SaaS tools.{" "}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Startup pricing.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300 md:text-xl"
        >
          Access exclusive deals on cloud services, analytics, marketing tools,
          and productivity software. Unlock verified perks and accelerate your
          startup journey.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/deals"
            className="group relative overflow-hidden rounded-full bg-white px-8 py-3.5 text-base font-semibold text-zinc-950 transition hover:scale-105"
          >
            <span className="relative z-10">Browse deals</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition group-hover:opacity-20" />
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-white/20 px-8 py-3.5 text-base font-medium text-white transition hover:border-white/40 hover:bg-white/5"
          >
            Create account
          </Link>
        </motion.div>

        {/* Floating cards */}
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {[
            { label: "$500K+", desc: "In savings unlocked" },
            { label: "50+", desc: "Partner deals" },
            { label: "2K+", desc: "Active founders" },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + idx * 0.1, duration: 0.6 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="text-3xl font-bold text-white">{stat.label}</div>
              <div className="mt-1 text-sm text-zinc-400">{stat.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
