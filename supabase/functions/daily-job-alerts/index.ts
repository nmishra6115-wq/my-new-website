// @ts-nocheck

import { serve } from "std/http/server.ts"
import { createClient } from "supabase-js"

serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data: subscribers } = await supabase.from('subscribers').select('email');
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: newFiles } = await supabase.from('partner_files').select('*').gt('created_at', yesterday);

  if (!subscribers || subscribers.length === 0) {
    return new Response(JSON.stringify({ message: "No subscribers" }), { status: 200 });
  }

  const fileListHtml = newFiles && newFiles.length > 0 
    ? newFiles.map((f: any) => `<li><a href="${f.url}">${f.name}</a></li>`).join('')
    : "<li>No new documents today.</li>";

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('EMAIL_API_KEY')}`
    },
    body: JSON.stringify({
      from: 'Updates <onboarding@resend.dev>',
      to: subscribers.map((s: any) => s.email),
      subject: 'Daily Job Updates',
      html: `<ul>${fileListHtml}</ul>`,
    })
  });

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
})