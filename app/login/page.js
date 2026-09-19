"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
export default function Login() {
  const [v, setV] = useState({ email: "", password: "" }),
    [err, setErr] = useState("");
  const r = useRouter();
  return (
    <section className="section">
      <div className="container">
        <div className="card form">
          <h1>Login</h1>
          <p className="muted">আপনার ChakriOKhobor account-এ প্রবেশ করুন।</p>
          <label>
            Email
            <input
              type="email"
              value={v.email}
              onChange={(e) => setV({ ...v, email: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={v.password}
              onChange={(e) => setV({ ...v, password: e.target.value })}
            />
          </label>
          <button
            className="btn"
            onClick={async () => {
              try {
                const x = await api("/auth/login", {
                  method: "POST",
                  body: JSON.stringify(v),
                });
                r.push(x.data?.role === "admin" ? "/admin" : "/dashboard");
              } catch (e) {
                setErr(e.message);
              }
            }}
          >
            Login
          </button>
          {err && <p>{err}</p>}
        </div>
      </div>
    </section>
  );
}
