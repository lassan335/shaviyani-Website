"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminLogin } from "../../actions";

function LoginForm() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await adminLogin(username, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(searchParams.get("next") || "/admin");
    router.refresh();
  };

  return (
    <form onSubmit={submit}>
      <label className="field full">
        <span>Username</span>
        <input
          required
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label className="field full">
        <span>Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      {error && (
        <div className="preorderNote" style={{ background: "#FEECEC", color: "var(--red)", marginTop: 14 }}>
          {error}
        </div>
      )}

      <button className="btn btnPrimary btnBlock" style={{ marginTop: 16 }} disabled={submitting} type="submit">
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="page" style={{ maxWidth: 400 }}>
      <div className="pageTitle">Admin Login</div>
      <p className="pageSub">Shaviyani Pro internal dashboard.</p>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
