export default async function handler(req,res){
  if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
  const supabaseUrl=process.env.SUPABASE_URL||"";
  const supabaseAnonKey=process.env.SUPABASE_ANON_KEY||"";
  if(!supabaseUrl||!supabaseAnonKey)return res.status(503).json({error:"O painel ainda não foi configurado."});
  res.setHeader("Cache-Control","no-store");
  return res.status(200).json({supabaseUrl,supabaseAnonKey});
}