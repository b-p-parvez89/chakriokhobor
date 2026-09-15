"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
export default function Header() {
  const [open, setOpen] = useState(false),
    [user, setUser] = useState(null);
  useEffect(() => {
    api("/auth/me")
      .then((x) => setUser(x.data))
      .catch(() => {});
  }, []);
  return (
    <header className="header">
      <div className="container nav">
        <Link href="/" className="brand">
          <span>চাকরি</span>ওখবর
        </Link>
        <button className="menu" onClick={() => setOpen(!open)}>
          ☰
        </button>
        <nav className={open ? "open" : ""}>
          {[
            ["/", "হোম"],
            ["/news", "সর্বশেষ"],
            ["/jobs", "চাকরি"],
            ["/education", "শিক্ষা"],
           
            ["/search", "সার্চ"],
          ].map(([h, t]) => (
            <Link key={h} href={h} onClick={() => setOpen(false)}>
              {t}
            </Link>
          ))}
          {user ? (
            <Link
              href={user.role === "admin" ? "/admin" : "/dashboard"}
              className="accountLink"
            >
              {user.role === "admin" ? "⚙ Admin" : "👤 Dashboard"}
            </Link>
          ) : (
            <Link href="/login" className="accountLink">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
