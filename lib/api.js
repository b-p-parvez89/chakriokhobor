const API=(process.env.NEXT_PUBLIC_API_URL).replace(/\/$/,'');

export async function api(path, options={}) {
  const cleanPath=path.startsWith('/')?path:`/${path}`;
  const res=await fetch(API+cleanPath,{
    ...options,
    headers:{'Content-Type':'application/json',...(options.headers||{})},
    credentials:'include',
    cache:options.cache||'no-store'
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok){
    const err=new Error(data.message||`Request failed (${res.status})`);
    err.status=res.status;
    throw err;
  }
  return data;
}

export const fmtDate=d=>d?new Intl.DateTimeFormat('bn-BD',{dateStyle:'medium'}).format(new Date(d)):'';
export { API };
