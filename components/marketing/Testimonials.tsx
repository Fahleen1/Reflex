"use client";

import { motion, useReducedMotion } from "framer-motion";
import { WaveBg } from "@/components/marketing/Decor";

const quotes = [
  {
    quote:
      "We were losing jobs every time we were on a ladder. Reflex texts back before the customer dials the next guy.",
    name: "Jordan Lee",
    role: "HVAC owner",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces",
  },
  {
    quote:
      "Setup took an afternoon. Now every missed call shows up as a conversation instead of a dead lead.",
    name: "Ayesha Khan",
    role: "Salon manager",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces",
  },
  {
    quote:
      "The WhatsApp flow is perfect for our Pakistan customers—no SMS friction, just a clear next step.",
    name: "Marcus Chen",
    role: "Detailing studio",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=faces",
  },
  {
    quote:
      "I used to check voicemail at night and find dead leads. Now they text me while I'm still on site.",
    name: "Priya Nair",
    role: "Plumbing co-owner",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces",
  },
  {
    quote:
      "Customers love getting a text right away. Half of them book before I even call back.",
    name: "Diego Ramos",
    role: "Auto shop",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces",
  },
];

function ReviewCard({
  quote,
  name,
  role,
  avatar,
}: (typeof quotes)[number]) {
  return (
    <article className="flex w-[min(85vw,22rem)] shrink-0 flex-col rounded-[1.75rem] border border-slate-100 bg-white p-7 shadow-md">
      <span className="text-4xl font-bold leading-none text-slate-950">
        &ldquo;
      </span>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-700">
        {quote}
      </p>
      <div className="mt-6 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-bold text-slate-950">{name}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
    </article>
  );
}

export function Testimonials() {
  const reduceMotion = useReducedMotion();
  const loop = [...quotes, ...quotes];

  return (
    <section className="relative bg-white py-20 sm:py-24">
      <WaveBg className="text-slate-300/35" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Real user feedback
          </h2>
          <p className="mt-4 text-slate-600">
            Placeholder quotes for now—swap these with real customer stories as
            you onboard trials.
          </p>
        </div>
      </div>

      <div className="relative mt-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24"
        />

        {/* Vertical padding keeps card bottoms/shadows from being clipped by overflow-x */}
        <div className="overflow-x-hidden py-6">
          <motion.div
            className="flex w-max items-stretch gap-5 px-4"
            animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
            transition={
              reduceMotion
                ? undefined
                : {
                    x: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 45,
                      ease: "linear",
                    },
                  }
            }
          >
            {loop.map((q, i) => (
              <ReviewCard key={`${q.name}-${i}`} {...q} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
