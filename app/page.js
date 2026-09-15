import Link from 'next/link';
import {api,fmtDate} from '../lib/api';

export default async function Home(){
  let d;
  try{d=(await api('/home')).data}catch{d={articles:[],jobs:[],education:[],tools:[],breaking:[]}}

  return <>
    <div className="breaking">
      <div className="container breakingInner">
        <span className="pill">🚨 ব্রেকিং</span>
        <span>{d.breaking?.[0]?.title||'চাকরি, শিক্ষা ও গুরুত্বপূর্ণ খবরের আপডেট এক জায়গায়'}</span>
      </div>
    </div>

    <section className="hero">
      <div className="container">
        <div className="heroGrid">
          <article className="card lead">
            <span className="tag">সর্বশেষ</span>
            <h1>{d.articles[0]?.title||'বাংলাদেশের চাকরি, শিক্ষা ও খবরের নতুন ঠিকানা'}</h1>
            <p>{d.articles[0]?.excerpt||'প্রয়োজনীয় তথ্য সহজভাবে খুঁজে নিন।'}</p>
            <Link className="btn secondary" href={d.articles[0]?`/news/${encodeURIComponent(d.articles[0].slug)}`:'/news'}>বিস্তারিত পড়ুন →</Link>
          </article>

          <div className="card">
            <h3>সর্বশেষ চাকরি</h3>
            <div className="list">
              {d.jobs.slice(0,5).map(j=><Link key={j._id} href={`/jobs/${encodeURIComponent(j.slug)}`} className="homeListCard"><div>{j.title}</div><div className="muted">{j.company} · {fmtDate(j.applicationDeadline)}</div></Link>)}
            </div>
            <br/><Link href="/jobs" className="btn">সব চাকরি</Link>
          </div>

          <div className="card">
            <h3>শিক্ষা আপডেট</h3>
            <div className="list">
              {d.education.slice(0,5).map(x=><Link key={x._id} href={`/education/${encodeURIComponent(x.slug)}`} className="homeListCard"><div>{x.title}</div><div className="muted">{x.category?.toUpperCase()}</div></Link>)}
            </div>
            <br/><Link href="/education" className="btn">সব শিক্ষা</Link>
          </div>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="sectionHead"><h2>সর্বশেষ খবর</h2><Link href="/news">সব খবর →</Link></div>
        <div className="grid3">
          {d.articles.slice(0,6).map(a=><Link className="card newsCard" href={`/news/${encodeURIComponent(a.slug)}`} key={a._id}>
            <span className="tag">{a.category}</span>
            {a.isBreaking&&<span className="dangerBadge">BREAKING</span>}
            <h3>{a.title}</h3>
            <p className="muted">{a.excerpt}</p>
            <small>{fmtDate(a.publishedAt)}</small>
          </Link>)}
        </div>
      </div>
    </section>
  </>
}
