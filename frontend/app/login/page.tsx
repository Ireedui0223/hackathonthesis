"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { defaultPassword, demoAccounts } from "@/lib/constants";
import { roleHome, storeSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState(defaultPassword);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.login(email, password);
      storeSession(result.token, result.user);
      router.push(roleHome(result.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Нэвтрэхэд алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-100 px-4 py-10 text-neutral-950">
      <section className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6">
        <Link href="/" className="text-sm font-bold text-neutral-500">
          Нүүр рүү буцах
        </Link>
        <h1 className="mt-4 text-3xl font-black">Нэвтрэх</h1>
        <p className="mt-2 text-neutral-600">Админы үүсгэсэн эсвэл demo эрхээр нэвтэрнэ.</p>

        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="data-label">
            Имэйл
            <input className="data-input" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="data-label">
            Нууц үг
            <input className="data-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <button className="data-button" disabled={loading}>
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>
        </form>

        <div className="mt-6 grid gap-2">
          <p className="text-sm font-bold text-neutral-500">Demo эрхүүд</p>
          {demoAccounts.map(([label, account]) => (
            <button key={account} className="rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm hover:bg-neutral-50" onClick={() => setEmail(account)}>
              <b>{label}</b>: {account}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
