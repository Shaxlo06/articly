"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Do I need to pay to try it?",
    a: "No — the Free plan lets you draft one article end-to-end with a limited number of AI runs per month.",
  },
  {
    q: "Which languages are supported for translation?",
    a: "Uzbek, English, and Russian at launch, with more academic language pairs planned.",
  },
  {
    q: "Can ArticlyApp guarantee Google Scholar indexing?",
    a: "No — we prepare your article's metadata and check readiness, but indexing itself is Google's decision and timeline.",
  },
];

// No email backend is wired up yet — this only simulates a submission so the
// form is demoable; wire a real endpoint before relying on it.
export function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 600);
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">Contact</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold">Questions before you start?</h2>
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-10">
        <div>
          {status === "sent" ? (
            <div className="rounded-lg border border-border bg-tint/40 p-6 text-sm">
              Thanks — your message has been noted. We&apos;ll get back to you soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  required
                  className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                className="text-sm font-semibold px-6 py-2.5 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}

          <div className="mt-6 text-sm text-muted">
            <p>Or reach us directly:</p>
            <p className="mt-1 font-medium text-foreground">support@smartarticle.uz</p>
          </div>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.q} className="rounded-lg border border-border bg-surface p-4 group">
              <summary className="cursor-pointer text-sm font-semibold list-none flex items-center justify-between">
                {faq.q}
                <span className="text-muted group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-2 text-sm text-muted leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
