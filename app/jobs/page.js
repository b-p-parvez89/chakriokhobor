import Link from 'next/link';
import {api,fmtDate} from '../../lib/api';
export const metadata={title:'চাকরি'};

export default async function Jobs({searchParams}){
  const sp=await searchParams;
  const qs=new URLSearchParams();
  if(sp?.q)qs.set('q',sp.q);
  const d=await api('/jobs?limit=50&'+qs).then(x=>x.data).catch(()=>[]);
  return <section className="section"><div className="container"><h1>চাকরি</h1><form className="searchbox" action="/jobs"><input name="q" defaultValue={sp?.q||''} placeholder="চাকরি বা প্রতিষ্ঠানের নাম খুঁজুন"/><button className="btn">Search</button></form><br/><div className="list">{d.map(j=><Link href={`/jobs/${encodeURIComponent(j.slug)}`} className="item jobCard" key={j._id}><div><span className="tag">{j.category}</span><h3>{j.title}</h3><div className="muted">{j.company} · {j.location||'বাংলাদেশ'} · {j.vacancies||'—'} পদ</div></div><div><b>শেষ তারিখ</b><br/>{fmtDate(j.applicationDeadline)}</div></Link>)}</div></div></section>
}
