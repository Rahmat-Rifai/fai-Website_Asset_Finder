"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

export function ScanProgress({ status }: { status?: string }) {
  const steps = [
    { label: "Validating URL", status: "status" },
    { label: "Connecting", status: "status" },
    { label: "Fetching HTML", status: "status" },
    { label: "Parsing assets", status: "status" },
    { label: "Analyzing metadata", status: "status" },
    { label: "Detecting technologies", status: "status" },
    { label: "Complete", status: "complete" },
  ];

  const [current, setCurrent] = useState(0);

  if (status) {
    const step = steps.find((s) => s.label === status);
    if (step) setCurrent(steps.indexOf(step));
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div
            key={step.label}
            className={`flex-1 h-2 rounded-full ${
              i < current
                ? "bg-blue-500"
                : i === current
                  ? "bg-blue-300"
                  : "bg-blue-100"
            }`}
          />
        ))}
      </div>
      <div className="mt-3 text-center text-sm text-slate-600">
        {steps[current].label}
      </div>
    </Card>
  );
}
