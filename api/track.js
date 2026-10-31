const ALLOWED = new Set(["page_view","invite_click","promo_copy","whatsapp_click","signup_start","signup_confirmed","kyc_verified","card_requested"]);
function response(res,status,body){return res.status(status).json(body)}
export default async function handler(req,res){
  if(req.method!=="POST")return response(res,405,{error:"Method not allowed"});
  const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return response(res,503,{error:"Analytics database is not configured"});
  let body=req.body;
  if(!body||typeof body!=="object"){try{body=JSON.parse(req.body||"{}")}catch{return response(res,400,{error:"Invalid JSON"})}}
  const event=String(body.event_name||"");
  if(!ALLOWED.has(event))return response(res,400,{error:"Invalid event"});
  const session=String(body.session_id||"");
  if(!/^[a-zA-Z0-9-]{16,80}$/.test(session))return response(res,400,{error:"Invalid session"});
  const clean=(v,max=120)=>typeof v==="string"?v.slice(0,max):"";
  const meta=body.metadata&&typeof body.metadata==="object"?body.metadata:{};
  const row={
    session_id:session,event_name:event,page_path:clean(body.page_path,200)||"/",
    source:clean(body.source,120)||"direct",medium:clean(body.medium,120),
    campaign:clean(body.campaign,160),content:clean(body.content,160),term:clean(body.term,160),
    referrer_host:clean(body.referrer,500).replace(/^https?:\/\//,"").split("/")[0],
    country:clean(req.headers["x-vercel-ip-country"],2)||null,
    device_type:/mobile|android|iphone/i.test(req.headers["user-agent"]||"")?"mobile":"desktop",
    metadata:{code:clean(meta.code,40)}
  };
  try{
    const r=await fetch(url+"/rest/v1/paygo_events",{method:"POST",headers:{"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(row)});
    if(!r.ok){const t=await r.text();console.error("analytics insert failed",r.status,t.slice(0,300));return response(res,502,{error:"Could not save analytics event"})}
    return response(res,202,{accepted:true});
  }catch(e){console.error("analytics error",e);return response(res,500,{error:"Analytics unavailable"})}
}