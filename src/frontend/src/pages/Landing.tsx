import {
  Bell,
  Building2,
  ChevronRight,
  Receipt,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";

interface LandingProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Track Tenants",
    description:
      "Manage all tenant profiles, agreements, deposits, and move-out dates from a single elegant dashboard.",
  },
  {
    icon: <Receipt className="h-6 w-6" />,
    title: "Manage Payments",
    description:
      "Log rent collections, track outstanding dues, and export payment history to Excel for detailed analysis.",
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: "Automate Reminders",
    description:
      "Never chase a payment again. Set up automatic reminders for rent, utility bills, and agreement renewals.",
  },
];

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center min-h-screen px-4 py-24 text-white"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.15 0.12 265) 0%, oklch(0.22 0.2 285) 40%, oklch(0.18 0.16 300) 100%)",
        }}
      >
        {/* Background orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
            style={{ background: "oklch(0.55 0.25 290)" }}
          />
          <div
            className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
            style={{ background: "oklch(0.6 0.2 260)" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-10 blur-[120px]"
            style={{ background: "oklch(0.7 0.15 300)" }}
          />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Brand badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
            style={{
              background: "oklch(1 0 0 / 0.1)",
              border: "1px solid oklch(1 0 0 / 0.18)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Shield
              className="h-4 w-4"
              style={{ color: "oklch(0.8 0.15 280)" }}
            />
            <span style={{ color: "oklch(0.9 0.05 270)" }}>
              Smart Property Management
            </span>
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 flex items-center justify-center gap-3"
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: "oklch(1 0 0 / 0.12)",
                border: "1px solid oklch(1 0 0 / 0.2)",
                boxShadow: "0 0 40px oklch(0.7 0.2 290 / 0.4)",
              }}
            >
              <Building2
                className="h-7 w-7"
                style={{ color: "oklch(0.85 0.1 280)" }}
              />
            </div>
            <h1
              className="text-6xl font-extrabold tracking-tight md:text-7xl"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Renqo
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mb-5 text-xl font-semibold tracking-wide md:text-2xl"
            style={{ color: "oklch(0.88 0.08 280)" }}
          >
            Smart Property Management, Simplified
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mb-10 max-w-xl text-base leading-relaxed md:text-lg"
            style={{ color: "oklch(0.78 0.04 270)" }}
          >
            Renqo helps property owners effortlessly track tenants, collect
            rent, manage bills, and stay on top of agreements — all in one
            place.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col items-center gap-3 sm:flex-row"
          >
            <button
              type="button"
              data-ocid="landing.get_started_button"
              onClick={onGetStarted}
              className="group flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 285), oklch(0.45 0.2 300))",
                boxShadow:
                  "0 0 40px oklch(0.55 0.22 285 / 0.45), 0 2px 20px oklch(0 0 0 / 0.3)",
                color: "oklch(1 0 0)",
              }}
            >
              Get Started
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <span className="text-sm" style={{ color: "oklch(0.65 0.04 270)" }}>
              Free to use • No credit card needed
            </span>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ color: "oklch(0.6 0.04 270)" }}
        >
          <span className="text-xs tracking-widest uppercase">Explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1.6,
              ease: "easeInOut",
            }}
            className="h-1 w-1 rounded-full"
            style={{ background: "oklch(0.6 0.04 270)" }}
          />
        </motion.div>
      </section>

      {/* Features */}
      <section
        className="px-4 py-20"
        style={{ background: "oklch(0.98 0.005 270)" }}
      >
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2
              className="mb-3 text-3xl font-bold md:text-4xl"
              style={{ color: "oklch(0.13 0.025 270)" }}
            >
              Everything you need to manage your properties
            </h2>
            <p className="text-base" style={{ color: "oklch(0.5 0.04 270)" }}>
              Purpose-built tools for modern landlords and property managers.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "oklch(1 0 0)",
                  border: "1px solid oklch(0.9 0.015 270)",
                  boxShadow: "0 2px 16px oklch(0.42 0.22 280 / 0.06)",
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 0%, oklch(0.42 0.22 280 / 0.06) 0%, transparent 70%)",
                  }}
                />
                <div
                  className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: "oklch(0.92 0.04 280)",
                    color: "oklch(0.42 0.22 280)",
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  className="relative mb-2 text-lg font-bold"
                  style={{ color: "oklch(0.13 0.025 270)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="relative text-sm leading-relaxed"
                  style={{ color: "oklch(0.5 0.04 270)" }}
                >
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        className="relative overflow-hidden px-4 py-16"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.18 285) 0%, oklch(0.24 0.2 300) 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-25 blur-3xl"
          style={{ background: "oklch(0.6 0.2 280)" }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-2xl font-bold text-white md:text-3xl"
          >
            Ready to simplify your property management?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <button
              type="button"
              data-ocid="landing.get_started_button"
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "oklch(1 0 0)",
                color: "oklch(0.3 0.18 280)",
                boxShadow: "0 4px 24px oklch(0 0 0 / 0.25)",
              }}
            >
              Get Started Free
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-4 py-6 text-center text-xs"
        style={{
          background: "oklch(0.12 0.01 270)",
          color: "oklch(0.5 0.04 270)",
        }}
      >
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
