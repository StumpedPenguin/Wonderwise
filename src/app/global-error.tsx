"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          margin: 0,
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(160deg,#e0f2fe,#ede9fe,#d1fae5)",
          color: "#334155",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "40px 32px",
            boxShadow: "0 10px 40px rgba(0,0,0,.1)",
          }}
        >
          <div style={{ fontSize: 56 }}>🛠️</div>
          <h1 style={{ margin: "12px 0 6px" }}>Something went wrong</h1>
          <p style={{ color: "#64748b", margin: 0 }}>Please try again.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              border: 0,
              borderRadius: 999,
              background: "#0ea5e9",
              color: "#fff",
              fontWeight: 700,
              padding: "12px 24px",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            🔄 Try again
          </button>
        </div>
      </body>
    </html>
  );
}
