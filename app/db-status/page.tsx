"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function DbStatusPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkDb() {
      setStatus("loading");
      setError(null);
      try {
        const res = await fetch("/api/admin/db-status");
        const data = await res.json();
        if (data.connected) {
          setStatus("success");
        } else {
          setStatus("error");
          setError(data.error || "Unknown error");
        }
      } catch (err: any) {
        setStatus("error");
        setError(err.message || "Unknown error");
      }
    }
    checkDb();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">Database Connection Status</h1>
      {status === "loading" && (
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin w-10 h-10 text-blue-500 mb-2" />
          <span className="text-blue-600">Checking connection...</span>
        </div>
      )}
      {status === "success" && (
        <div className="flex flex-col items-center">
          <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
          <span className="text-green-700 font-semibold">Database connection successful!</span>
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center">
          <XCircle className="w-10 h-10 text-red-500 mb-2" />
          <span className="text-red-700 font-semibold">Database connection failed.</span>
          {error && <pre className="mt-2 text-xs text-gray-700 bg-gray-100 p-2 rounded w-full overflow-x-auto">{error}</pre>}
        </div>
      )}
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => window.location.reload()}
      >
        Re-check Connection
      </button>
    </div>
  );
} 