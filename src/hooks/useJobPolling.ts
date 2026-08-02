"use client";

import { useEffect, useRef, useState } from "react";

export interface JobState {
  id: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  output: Record<string, unknown> | null;
  error: string | null;
}

/**
 * Polls `${endpoint}/${jobId}` with capped exponential backoff (1s → 5s)
 * while the job is QUEUED/PROCESSING, stopping once it settles. This is the
 * client half of the async-job pattern described in the spec — simple
 * polling for now, swappable for SSE/WebSockets later without changing the
 * module UIs that consume this hook.
 */
export function useJobPolling(endpoint: string, initial: JobState) {
  const [job, setJob] = useState<JobState>(initial);
  const delayRef = useRef(1000);

  useEffect(() => {
    if (job.status === "COMPLETED" || job.status === "FAILED") return;

    let cancelled = false;
    const timer = setTimeout(async function poll() {
      try {
        const res = await fetch(`${endpoint}/${job.id}`);
        const data = (await res.json()) as JobState;
        if (cancelled) return;
        setJob(data);
        if (data.status !== "COMPLETED" && data.status !== "FAILED") {
          delayRef.current = Math.min(delayRef.current + 500, 5000);
        }
      } catch {
        // transient network hiccup — the effect re-runs on next job state change
      }
    }, delayRef.current);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [endpoint, job]);

  return job;
}
