export default async function handler(req,res){
  if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
  const url=process.env.SUPABASE_URL, service=process.env.SUPABASE_SERVICE_ROLE_KEY, anon=process.env.SUPABASE_ANON_KEY, admin=String(process.env.PAYGO_ADMIN_EMAIL||"").toLowerCase();
  if(!url||!service||!anon||!admin)return res.status(503).json({error:"Admin analytics is not configured"});
  const token=String(req.headers.authorization||"").replace(/^Bearer\s+/i,"");
  if(!token)return res.status(401).json({error:"Authentication required"});
  try{
    const u=await fetch(url+"/auth/v1/user",{headers:{"apikey":anon,"Authorization":"Bearer "+token}});
    if(!u.ok)return res.status(401).json({error:"Invalid session"});
    const user=await u.json();
    if(String(user.email||"").toLowerCase()!==admin||!user.email_confirmed_at)return res.status(403).json({error:"Not authorized"});
    const days=Math.max(1,Math.min(90,Number(req.query.days)||30));
    const rpc=await fetch(url+"/rest/v1/rpc/paygo_admin_metrics",{method:"POST",headers:{"apikey":service,"Authorization":"Bearer "+service,"Content-Type":"application/json"},body:JSON.stringify({p_days:days})});
    const data=await rpc.json();
    if(!rpc.ok){console.error("metrics rpc failed",rpc.status,data);return res.status(502).json({error:"Could not load analytics"})}
    return res.status(200).json(data);
  }catch(e){console.error("admin metrics error",e);return res.status(500).json({error:"Analytics unavailable"})}
}