"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "../../../lib/format";
import { changeAdminPassword, createAdminUser } from "../../actions";

export default function AdminSettings({ currentUsername, initialUsers }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMessage, setPwMessage] = useState(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const [newUsername, setNewUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [userMessage, setUserMessage] = useState(null);
  const [userSubmitting, setUserSubmitting] = useState(false);

  async function submitPasswordChange(e) {
    e.preventDefault();
    setPwMessage(null);
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: "warn", text: "New password and confirmation don't match." });
      return;
    }
    setPwSubmitting(true);
    const res = await changeAdminPassword(currentPassword, newPassword);
    setPwSubmitting(false);
    if (res.error) {
      setPwMessage({ type: "warn", text: res.error });
      return;
    }
    setPwMessage({ type: "ok", text: "Password changed." });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function submitCreateUser(e) {
    e.preventDefault();
    setUserMessage(null);
    setUserSubmitting(true);
    const res = await createAdminUser(newUsername, newUserPassword);
    setUserSubmitting(false);
    if (res.error) {
      setUserMessage({ type: "warn", text: res.error });
      return;
    }
    setUsers((prev) => [...prev, { username: newUsername.trim(), createdAt: new Date().toISOString() }]);
    setUserMessage({ type: "ok", text: `User "${newUsername.trim()}" created.` });
    setNewUsername("");
    setNewUserPassword("");
    router.refresh();
  }

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div className="pageTitle">Admin Settings</div>
          <p className="pageSub">Signed in as {currentUsername || "unknown"}.</p>
        </div>
        <Link href="/admin" className="btn btnOutlineDark">
          ← Back to dashboard
        </Link>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <div className="detailLabel" style={{ marginBottom: 10 }}>
          Change your password
        </div>
        <form onSubmit={submitPasswordChange} className="formGrid">
          <label className="field full">
            <span>Current password</span>
            <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </label>
          <label className="field">
            <span>New password</span>
            <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </label>
          <label className="field">
            <span>Confirm new password</span>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
          {pwMessage && (
            <div
              className="field full preorderNote"
              style={{
                background: pwMessage.type === "ok" ? "#EAF7EF" : "#FEECEC",
                color: pwMessage.type === "ok" ? "#2F8F6B" : "var(--red)",
              }}
            >
              {pwMessage.text}
            </div>
          )}
          <div className="field full">
            <button type="submit" className="btn btnDark" disabled={pwSubmitting}>
              {pwSubmitting ? "Changing…" : "Change password"}
            </button>
          </div>
        </form>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 20 }}>
        <div className="detailLabel" style={{ marginBottom: 10 }}>
          Admin users
        </div>
        {users.map((u) => (
          <div className="summaryRow" key={u.username}>
            <span>{u.username}</span>
            <span style={{ color: "#8A8F98" }}>{formatDate(u.createdAt)}</span>
          </div>
        ))}
        {users.length === 0 && (
          <div style={{ color: "#8A8F98", fontSize: 13, marginBottom: 10 }}>
            No dedicated user accounts yet — logins fall back to ADMIN_PASSWORD.
          </div>
        )}

        <form onSubmit={submitCreateUser} className="formGrid" style={{ marginTop: 16 }}>
          <label className="field">
            <span>New username</span>
            <input required value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
            />
          </label>
          {userMessage && (
            <div
              className="field full preorderNote"
              style={{
                background: userMessage.type === "ok" ? "#EAF7EF" : "#FEECEC",
                color: userMessage.type === "ok" ? "#2F8F6B" : "var(--red)",
              }}
            >
              {userMessage.text}
            </div>
          )}
          <div className="field full">
            <button type="submit" className="btn btnDark" disabled={userSubmitting}>
              {userSubmitting ? "Creating…" : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
