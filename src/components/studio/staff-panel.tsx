"use client";

// Staff management for the Studio: your-account card (change password) for
// everyone, plus the team roster (add / remove accounts) for the owner.
// Staff emails are only ever shown here, behind staff auth — never publicly.
import { useCallback, useEffect, useState } from "react";
import { UserPlus, ShieldCheck, Trash2, KeyRound, Loader2 } from "lucide-react";
import type { SessionUser } from "@/lib/session";

interface StaffRow {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

const inputCls =
  "w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:border-[#ff2e88]/60 focus:outline-none";
const labelCls = "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/45";

export function StaffPanel({ me, onMeChange }: { me: SessionUser; onMeChange: (m: SessionUser) => void }) {
  const isOwner = me.role === "owner";

  return (
    <div className={`grid gap-5 ${isOwner ? "lg:grid-cols-2" : "mx-auto max-w-xl"}`}>
      <AccountCard me={me} />
      {isOwner && <TeamCard me={me} />}
    </div>
  );
}

// ————— Your account —————

function AccountCard({ me }: { me: SessionUser }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async () => {
    setMsg(null);
    if (next !== confirm) {
      setMsg({ ok: false, text: "New passwords don't match." });
      return;
    }
    setBusy(true);
    const r = await fetch("/api/studio/staff/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current, next }),
    });
    const d = await r.json().catch(() => ({}) as { error?: string });
    setBusy(false);
    if (r.ok) {
      setMsg({ ok: true, text: "Password updated." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } else {
      setMsg({ ok: false, text: d.error || "Could not update the password." });
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <KeyRound className="h-4.5 w-4.5 text-[#7df2d8]" />
        <h2 className="text-[15px] font-bold">Your account</h2>
        <span className={`ml-auto rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
          me.role === "owner" ? "bg-[#ff2e88]/20 text-[#ff8ec2]" : "bg-white/10 text-white/60"
        }`}>
          {me.role}
        </span>
      </div>
      <p className="mb-4 text-[12.5px] leading-relaxed text-white/45">
        Account: <span className="font-semibold text-white/80">{me.email}</span>. Change your
        password here — it applies the next time you sign in; your current session keeps working.
      </p>
      <div className="grid gap-3">
        <div>
          <label className={labelCls} htmlFor="pw-current">Current password</label>
          <input id="pw-current" type="password" className={inputCls} value={current} autoComplete="current-password"
            onChange={(e) => setCurrent(e.target.value)} placeholder="Your current password" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="pw-next">New password</label>
            <input id="pw-next" type="password" className={inputCls} value={next} autoComplete="new-password"
              onChange={(e) => setNext(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <div>
            <label className={labelCls} htmlFor="pw-confirm">Confirm new password</label>
            <input id="pw-confirm" type="password" className={inputCls} value={confirm} autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat it" />
          </div>
        </div>
        {msg && <p className={`text-[12.5px] ${msg.ok ? "text-[#7df2d8]" : "text-[#ff5c7a]"}`}>{msg.text}</p>}
        <button
          onClick={submit}
          disabled={busy || !current || next.length < 8 || !confirm}
          className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] px-4 py-2 text-[13px] font-semibold text-black disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {busy ? "Updating…" : "Update password"}
        </button>
      </div>
    </section>
  );
}

// ————— Team roster (owner only) —————

function TeamCard({ me }: { me: SessionUser }) {
  const [rows, setRows] = useState<StaffRow[] | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"editor" | "owner">("editor");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/studio/staff", { cache: "no-store" });
    if (r.ok) {
      const d = (await r.json()) as { users: StaffRow[] };
      setRows(d.users);
    }
  }, []);

  useEffect(() => {
    fetch("/api/studio/staff", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.resolve(null)))
      .then((d: { users: StaffRow[] } | null) => { if (d?.users) setRows(d.users); })
      .catch(() => {});
  }, []);

  const add = async () => {
    setMsg(null);
    setBusy(true);
    const r = await fetch("/api/studio/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const d = await r.json().catch(() => ({}) as { error?: string });
    setBusy(false);
    if (r.ok) {
      setMsg({ ok: true, text: `${email} can now sign in to the Studio.` });
      setEmail("");
      setPassword("");
      setRole("editor");
      void load();
    } else {
      setMsg({ ok: false, text: d.error || "Could not add the account." });
    }
  };

  const remove = async (row: StaffRow) => {
    setMsg(null);
    if (!window.confirm(`Remove ${row.email}'s access to the Studio?`)) return;
    const r = await fetch(`/api/studio/staff/${row.id}`, { method: "DELETE" });
    const d = await r.json().catch(() => ({}) as { error?: string });
    if (r.ok) {
      setMsg({ ok: true, text: `${row.email} no longer has access.` });
      void load();
    } else {
      setMsg({ ok: false, text: d.error || "Could not remove the account." });
    }
  };

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <UserPlus className="h-4.5 w-4.5 text-[#ff8ec2]" />
        <h2 className="text-[15px] font-bold">The team</h2>
        <span className="ml-auto text-[11px] uppercase tracking-wider text-white/35">owner tools</span>
      </div>
      <p className="mb-4 text-[12.5px] leading-relaxed text-white/45">
        Assign staff with their email and a password. Editors can change every part of the site but
        cannot manage accounts. Removing an account revokes its access immediately. Staff emails are
        kept server-side only — never shown to visitors and never committed to the repository.
      </p>

      {/* add form */}
      <div className="mb-5 grid gap-3 rounded-xl border border-white/8 bg-black/25 p-4 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label className={labelCls} htmlFor="staff-email">Staff email</label>
          <input id="staff-email" type="email" className={inputCls} value={email}
            autoCapitalize="none"
            onChange={(e) => setEmail(e.target.value)} placeholder="colleague@example.com" />
        </div>
        <div>
          <label className={labelCls} htmlFor="staff-pass">Password</label>
          <input id="staff-pass" type="password" className={inputCls} value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label className={labelCls} htmlFor="staff-role">Role</label>
            <select id="staff-role" className={inputCls} value={role} onChange={(e) => setRole(e.target.value === "owner" ? "owner" : "editor")}>
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <button
            onClick={add}
            disabled={busy || !emailOk || password.length < 8}
            className="inline-flex h-[38px] items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] px-4 text-[13px] font-semibold text-black disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Add
          </button>
        </div>
      </div>

      {msg && <p className={`mb-3 text-[12.5px] ${msg.ok ? "text-[#7df2d8]" : "text-[#ff5c7a]"}`}>{msg.text}</p>}

      {/* roster */}
      {rows === null ? (
        <div className="flex items-center gap-2 text-[12.5px] text-white/40">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading the roster…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-[12.5px] text-white/40">No staff accounts yet — add the first one above.</p>
      ) : (
        <ul className="grid gap-2">
          {rows.map((row) => {
            const handle = row.email.split("@")[0] || row.email;
            const self = row.email === me.email;
            return (
              <li key={row.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff2e88] to-[#7df2d8] text-[12px] font-black text-black">
                  {handle.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold">
                    {handle}
                    {self && <span className="ml-2 text-[11px] font-normal text-white/40">(you)</span>}
                  </p>
                  <p className="truncate text-[11px] text-white/40">{row.email}</p>
                </div>
                <span className={`ml-auto shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  row.role === "owner" ? "bg-[#ff2e88]/20 text-[#ff8ec2]" : "bg-white/10 text-white/60"
                }`}>
                  {row.role}
                </span>
                <button
                  onClick={() => remove(row)}
                  disabled={self}
                  title={self ? "You cannot remove your own account" : `Remove ${handle}`}
                  className="rounded-lg p-2 text-white/40 transition-colors hover:bg-[#ff2e88]/15 hover:text-[#ff8ec2] disabled:pointer-events-none disabled:opacity-25"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
