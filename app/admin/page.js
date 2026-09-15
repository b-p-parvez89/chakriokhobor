"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import RichTextEditor from "../../components/RichTextEditor";

const categories = [
  ["bangladesh", "বাংলাদেশ"],
  ["politics", "রাজনীতি"],
  ["district", "জেলা সংবাদ"],
  ["international", "আন্তর্জাতিক"],
  ["economy", "অর্থনীতি"],
  ["crime", "অপরাধ"],
  ["court", "আদালত"],
  ["sports", "খেলাধুলা"],
  ["technology", "প্রযুক্তি"],
  ["entertainment", "বিনোদন"],
  ["education", "শিক্ষা"],
  ["health", "স্বাস্থ্য"],
  ["opinion", "মতামত"],
  ["fact-check", "ফ্যাক্ট-চেক"],
  ["video", "ভিডিও"],
  ["trending", "ট্রেন্ডিং"],
];

const blank = {
  title: "",
  category: "bangladesh",
  excerpt: "",
  content: "",
  status: "draft",
  featuredImage: "",
  youtubeUrl: "",
  isBreaking: false,
  isFeatured: false,
  seo: {
    title: "",
    description: "",
    keywords: "",
    canonical: "",
  },
};

const blankSeo = {
  siteTitle: "",
  siteDescription: "",
  keywords: "",
  canonical: "",
  adsenseEnabled: false,
  adsenseClient: "",
  adsenseSlot: "",
};

export default function Admin() {
  const [stats, setStats] = useState({});
  const [tab, setTab] = useState("articles");
  const [items, setItems] = useState([]);
  const [v, setV] = useState(blank);
  const [seo, setSeo] = useState(blankSeo);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh(t = tab) {
    if (t === "seo") return;

    try {
      const [contentRes, statsRes] = await Promise.all([
        api(`/admin/${t}`),
        api("/admin/stats"),
      ]);

      setItems(contentRes.data || []);
      setStats(statsRes.data || {});
    } catch (e) {
      setMsg(e.message || "Data load failed");
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const me = await api("/auth/me");

        if (me?.data?.role !== "admin") {
          location.href = "/dashboard";
          return;
        }

        await refresh("articles");

        const s = await api("/admin/settings");
        setSeo({
          ...blankSeo,
          ...s.data,
        });
      } catch {
        location.href = "/login";
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loading && tab !== "seo") {
      refresh(tab).catch(() => {});
    }
  }, [tab]);

  const startEdit = (x) => {
    setEditing(x._id);

    setV({
      ...blank,
      ...x,
      seo: {
        ...blank.seo,
        ...x.seo,
        keywords: Array.isArray(x.seo?.keywords)
          ? x.seo.keywords.join(", ")
          : x.seo?.keywords || "",
      },
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const resetForm = () => {
    setV({
      ...blank,
      seo: {
        ...blank.seo,
      },
    });

    setEditing(null);
  };

  const save = async () => {
    try {
      setMsg("");

      if (!v.title.trim()) {
        throw Error("Title দিন");
      }

      if (
        (tab === "articles" || tab === "education") &&
        !v.content.trim()
      ) {
        throw Error("Content দিন");
      }

      if (tab === "jobs") {
        if (!v.company?.trim()) {
          throw Error("Company name দিন");
        }

        if (!v.description?.trim()) {
          throw Error("Job description দিন");
        }
      }

      const payload = {
        ...v,
        seo: {
          ...v.seo,
          keywords: String(v.seo?.keywords || "")
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
        },
      };

      if (
        tab === "articles" &&
        payload.status === "published" &&
        !payload.publishedAt
      ) {
        payload.publishedAt = new Date().toISOString();
      }

      const path = editing
        ? `/admin/${tab}/${editing}`
        : `/admin/${tab}`;

      await api(path, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      setMsg(
        editing
          ? "Content updated successfully"
          : "Content published successfully"
      );

      resetForm();

      await refresh(tab);
    } catch (e) {
      setMsg(e.message || "Something went wrong");
    }
  };

  const remove = async (id) => {
    if (!confirm("এই content delete করবেন?")) return;

    try {
      await api(`/admin/${tab}/${id}`, {
        method: "DELETE",
      });

      setMsg("Content deleted successfully");

      await refresh(tab);
    } catch (e) {
      setMsg(e.message || "Delete failed");
    }
  };

  const saveSeo = async () => {
    try {
      const x = await api("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(seo),
      });

      setSeo({
        ...blankSeo,
        ...x.data,
      });

      setMsg("SEO & AdSense settings saved");
    } catch (e) {
      setMsg(e.message || "Settings save failed");
    }
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="card loadingCard">
            Loading admin...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section adminPage">
      <div className="container">

        {/* ADMIN HEADER */}
        <div className="adminTop">
          <div>
            <span className="eyebrow">
              CONTENT MANAGEMENT SYSTEM
            </span>

            <h1>ChakriOKhobor Admin</h1>

            <p className="muted">
              News publish, SEO, breaking news এবং content
              management এক জায়গায়।
            </p>
          </div>

          <a href="/" className="btn secondary">
            View website ↗
          </a>
        </div>

        {/* STATS */}
        <div className="stats">
          {[
            ["📰", "Articles", stats.articles],
            ["💼", "Jobs", stats.jobs],
            ["🎓", "Education", stats.education],
            ["🚨", "Breaking", stats.breaking],
          ].map(([icon, key, value]) => (
            <div className="stat" key={key}>
              <span>{icon}</span>

              <div>
                <small>{key}</small>
                <b>{value ?? 0}</b>
              </div>
            </div>
          ))}
        </div>

        {/* ADMIN LAYOUT */}
        <div className="adminLayout">

          {/* SIDEBAR */}
          <aside className="side">

            <div className="sideTitle">
              PUBLISHING
            </div>

            {/* NEWS */}
            <button
              className={
                tab === "articles"
                  ? "sideBtn active"
                  : "sideBtn"
              }
              onClick={() => {
                setTab("articles");
                resetForm();
                setMsg("");
              }}
            >
              📰 News
            </button>

            {/* JOBS */}
            <button
              className={
                tab === "jobs"
                  ? "sideBtn active"
                  : "sideBtn"
              }
              onClick={() => {
                setTab("jobs");
                resetForm();
                setMsg("");
              }}
            >
              💼 Jobs
            </button>

            {/* EDUCATION */}
            <button
              className={
                tab === "education"
                  ? "sideBtn active"
                  : "sideBtn"
              }
              onClick={() => {
                setTab("education");
                resetForm();
                setMsg("");
              }}
            >
              🎓 Education
            </button>

            <div className="sideTitle">
              SETTINGS
            </div>

            {/* SEO */}
            <button
              className={
                tab === "seo"
                  ? "sideBtn active"
                  : "sideBtn"
              }
              onClick={() => {
                setTab("seo");
                setMsg("");
              }}
            >
              🔍 SEO & AdSense
            </button>

            <a href="/" className="sideLink">
              ↗ View site
            </a>
          </aside>

          {/* MAIN CONTENT */}
          <div className="adminMain">

            {/* SEO PANEL */}
            {tab === "seo" ? (
              <SeoPanel
                seo={seo}
                setSeo={setSeo}
                save={saveSeo}
              />
            ) : (
              <>

                {/* CONTENT FORM */}
                <div className="card form wide">

                  <div className="formHeader">

                    <div>
                      <span className="tag">
                        {editing
                          ? "EDIT CONTENT"
                          : "NEW CONTENT"}
                      </span>

                      <h2>
                        {editing
                          ? "Content edit করুন"
                          : `${tab} publish করুন`}
                      </h2>
                    </div>

                    {editing && (
                      <button
                        className="btn secondary"
                        onClick={resetForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {/* TITLE */}
                  <label>
                    Title

                    <input
                      value={v.title}
                      onChange={(e) =>
                        setV({
                          ...v,
                          title: e.target.value,
                        })
                      }
                      placeholder="শিরোনাম লিখুন"
                    />
                  </label>

                  {/* CATEGORY */}
                  {(tab === "articles" ||
                    tab === "education") && (
                    <label>
                      Category

                      <select
                        value={v.category}
                        onChange={(e) =>
                          setV({
                            ...v,
                            category: e.target.value,
                          })
                        }
                      >
                        {categories.map(([key, name]) => (
                          <option
                            value={key}
                            key={key}
                          >
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {/* JOB FORM */}
                  {tab === "jobs" ? (
                    <>
                      <label>
                        Company

                        <input
                          value={v.company || ""}
                          onChange={(e) =>
                            setV({
                              ...v,
                              company: e.target.value,
                            })
                          }
                          placeholder="Company name"
                        />
                      </label>

                      <label>
                        Deadline

                        <input
                          type="date"
                          value={
                            v.applicationDeadline
                              ? String(
                                  v.applicationDeadline
                                ).slice(0, 10)
                              : ""
                          }
                          onChange={(e) =>
                            setV({
                              ...v,
                              applicationDeadline:
                                e.target.value,
                            })
                          }
                        />
                      </label>

                      <label>
                        Application URL

                        <input
                          value={
                            v.applicationUrl || ""
                          }
                          onChange={(e) =>
                            setV({
                              ...v,
                              applicationUrl:
                                e.target.value,
                            })
                          }
                          placeholder="https://..."
                        />
                      </label>

                      <label>
                        Qualification

                        <textarea
                          value={
                            v.qualification || ""
                          }
                          onChange={(e) =>
                            setV({
                              ...v,
                              qualification:
                                e.target.value,
                            })
                          }
                          placeholder="Educational qualification"
                        />
                      </label>

                      <label>
                        Description

                        <textarea
                          rows="6"
                          value={
                            v.description || ""
                          }
                          onChange={(e) =>
                            setV({
                              ...v,
                              description:
                                e.target.value,
                            })
                          }
                          placeholder="Job description"
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      {/* EXCERPT */}
                      <label>
                        Excerpt{" "}
                        <span className="fieldHint">
                          ১–২ লাইনের সংক্ষিপ্ত summary
                        </span>

                        <textarea
                          rows="3"
                          value={v.excerpt}
                          onChange={(e) =>
                            setV({
                              ...v,
                              excerpt:
                                e.target.value,
                            })
                          }
                          placeholder="সংক্ষেপে লিখুন"
                        />
                      </label>

                      {/* IMAGE */}
                      <label>
                        Featured Image URL

                        <input
                          value={
                            v.featuredImage
                          }
                          onChange={(e) =>
                            setV({
                              ...v,
                              featuredImage:
                                e.target.value,
                            })
                          }
                          placeholder="https://..."
                        />
                      </label>

                      {/* CONTENT */}
                      <label>
                        Article Content

                        <RichTextEditor
                          value={v.content}
                          onChange={(content) =>
                            setV({
                              ...v,
                              content,
                            })
                          }
                        />
                      </label>

                      {/* YOUTUBE */}
                      {tab === "articles" && (
                        <label>
                          YouTube Video URL{" "}
                          <span className="fieldHint">
                            Optional
                          </span>

                          <input
                            value={
                              v.youtubeUrl
                            }
                            onChange={(e) =>
                              setV({
                                ...v,
                                youtubeUrl:
                                  e.target.value,
                              })
                            }
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                        </label>
                      )}
                    </>
                  )}

                  {/* BREAKING / FEATURED */}
                  {tab === "articles" && (
                    <div className="checkGrid">

                      <label className="check">
                        <input
                          type="checkbox"
                          checked={
                            !!v.isBreaking
                          }
                          onChange={(e) =>
                            setV({
                              ...v,
                              isBreaking:
                                e.target.checked,
                            })
                          }
                        />

                        <span>
                          🚨 Breaking News
                        </span>
                      </label>

                      <label className="check">
                        <input
                          type="checkbox"
                          checked={
                            !!v.isFeatured
                          }
                          onChange={(e) =>
                            setV({
                              ...v,
                              isFeatured:
                                e.target.checked,
                            })
                          }
                        />

                        <span>
                          ⭐ Featured
                        </span>
                      </label>

                    </div>
                  )}

                  {/* ARTICLE SEO */}
                  {tab === "articles" && (
                    <div className="seoBox">

                      <div className="formHeader">
                        <div>
                          <span className="tag">
                            SEO
                          </span>

                          <h3>
                            এই Article-এর SEO
                          </h3>
                        </div>
                      </div>

                      <label>
                        SEO Title

                        <input
                          value={
                            v.seo.title
                          }
                          onChange={(e) =>
                            setV({
                              ...v,
                              seo: {
                                ...v.seo,
                                title:
                                  e.target.value,
                              },
                            })
                          }
                          placeholder="Google result-এর title"
                        />
                      </label>

                      <label>
                        SEO Description

                        <textarea
                          rows="3"
                          value={
                            v.seo.description
                          }
                          onChange={(e) =>
                            setV({
                              ...v,
                              seo: {
                                ...v.seo,
                                description:
                                  e.target.value,
                              },
                            })
                          }
                          placeholder="Google result-এর short description"
                        />
                      </label>

                      <label>
                        SEO Keywords

                        <input
                          value={
                            v.seo.keywords
                          }
                          onChange={(e) =>
                            setV({
                              ...v,
                              seo: {
                                ...v.seo,
                                keywords:
                                  e.target.value,
                              },
                            })
                          }
                          placeholder="চাকরি, চাকরির খবর, বাংলাদেশ চাকরি"
                        />
                      </label>

                      <label>
                        Canonical URL

                        <input
                          value={
                            v.seo.canonical
                          }
                          onChange={(e) =>
                            setV({
                              ...v,
                              seo: {
                                ...v.seo,
                                canonical:
                                  e.target.value,
                              },
                            })
                          }
                          placeholder="https://example.com/news/..."
                        />
                      </label>

                    </div>
                  )}

                  {/* STATUS */}
                  <label>
                    Status

                    <select
                      value={v.status}
                      onChange={(e) =>
                        setV({
                          ...v,
                          status:
                            e.target.value,
                        })
                      }
                    >
                      <option value="draft">
                        Draft
                      </option>

                      <option value="review">
                        Review
                      </option>

                      <option value="published">
                        Published
                      </option>

                      <option value="archived">
                        Archived
                      </option>
                    </select>
                  </label>

                  {/* SAVE */}
                  <div className="formActions">

                    <button
                      className="btn"
                      onClick={save}
                    >
                      {editing
                        ? "Update"
                        : "Save & Publish"}
                    </button>

                    {msg && (
                      <span className="formMsg">
                        {msg}
                      </span>
                    )}

                  </div>
                </div>

                {/* RECENT CONTENT */}
                <div className="card recent">

                  <div className="sectionHead">
                    <h2>
                      Recent{" "}
                      {tab === "articles"
                        ? "News"
                        : tab === "jobs"
                          ? "Jobs"
                          : "Education"}
                    </h2>

                    <span className="muted">
                      Edit / delete / manage
                    </span>
                  </div>

                  <div className="adminItems">

                    {items.length === 0 ? (
                      <div className="emptyState">
                        <div className="notFoundIcon">
                          📰
                        </div>

                        <h3>
                          No content found
                        </h3>

                        <p className="muted">
                          এখনো কোনো content publish করা
                          হয়নি।
                        </p>
                      </div>
                    ) : (
                      items
                        .slice(0, 30)
                        .map((x) => (
                          <div
                            className="adminItem"
                            key={x._id}
                          >
                            <div>

                              <div className="itemBadges">

                                {x.isBreaking && (
                                  <span className="dangerBadge">
                                    BREAKING
                                  </span>
                                )}

                                <span className="tag">
                                  {x.category ||
                                    x.status ||
                                    "content"}
                                </span>

                              </div>

                              <b>
                                {x.title ||
                                  x.name}
                              </b>

                              <small className="muted">
                                {x.status || ""}
                              </small>

                            </div>

                            <div className="actions">

                              <button
                                className="miniBtn"
                                onClick={() =>
                                  startEdit(x)
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="miniBtn danger"
                                onClick={() =>
                                  remove(x._id)
                                }
                              >
                                Delete
                              </button>

                            </div>
                          </div>
                        ))
                    )}

                  </div>
                </div>

              </>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}

function SeoPanel({
  seo,
  setSeo,
  save,
}) {
  return (
    <div className="card form wide">

      <span className="tag">
        SITE SEO
      </span>

      <h2>
        SEO & Google AdSense
      </h2>

      <label>
        Site Title

        <input
          value={seo.siteTitle}
          onChange={(e) =>
            setSeo({
              ...seo,
              siteTitle: e.target.value,
            })
          }
          placeholder="ChakriOKhobor - চাকরি ও খবর"
        />
      </label>

      <label>
        Meta Description

        <textarea
          rows="3"
          value={seo.siteDescription}
          onChange={(e) =>
            setSeo({
              ...seo,
              siteDescription:
                e.target.value,
            })
          }
          placeholder="আপনার website-এর description"
        />
      </label>

      <label>
        Keywords

        <input
          value={seo.keywords}
          onChange={(e) =>
            setSeo({
              ...seo,
              keywords: e.target.value,
            })
          }
          placeholder="চাকরি, চাকরির খবর, সরকারি চাকরি, বাংলাদেশ খবর"
        />
      </label>

      <label>
        Canonical URL

        <input
          value={seo.canonical}
          onChange={(e) =>
            setSeo({
              ...seo,
              canonical: e.target.value,
            })
          }
          placeholder="https://yourdomain.com"
        />
      </label>

      <div className="seoBox">

        <h3>
          Google AdSense
        </h3>

        <label className="check">

          <input
            type="checkbox"
            checked={
              !!seo.adsenseEnabled
            }
            onChange={(e) =>
              setSeo({
                ...seo,
                adsenseEnabled:
                  e.target.checked,
              })
            }
          />

          <span>
            Enable Google AdSense
          </span>

        </label>

        <label>
          Publisher ID

          <input
            value={
              seo.adsenseClient
            }
            onChange={(e) =>
              setSeo({
                ...seo,
                adsenseClient:
                  e.target.value,
              })
            }
            placeholder="ca-pub-xxxxxxxxxxxxxxxx"
          />
        </label>

        <label>
          Ad Slot ID

          <input
            value={
              seo.adsenseSlot
            }
            onChange={(e) =>
              setSeo({
                ...seo,
                adsenseSlot:
                  e.target.value,
              })
            }
            placeholder="1234567890"
          />
        </label>

      </div>

      <button
        className="btn"
        onClick={save}
      >
        Save Settings
      </button>

    </div>
  );
}