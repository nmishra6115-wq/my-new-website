// @ts-nocheck
import { serve } from "std/http/server.ts"
import { createClient } from "supabase-js"

serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Get all subscribers from your table
  const { data: subscribers } = await supabase.from('subscribers').select('email');
  
  // 2. Look for files uploaded in the last 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: newFiles } = await supabase.from('partner_files').select('*').gt('created_at', yesterday);

  if (!subscribers || subscribers.length === 0) {
    return new Response(JSON.stringify({ message: "No subscribers" }), { status: 200 });
  }

  // 3. Create the "Premium" Job Cards for the email
  const fileListHtml = newFiles && newFiles.length > 0 
    ? newFiles.map((f: any) => `
        <div style="background: #0f172a; padding: 20px; border-left: 4px solid #10b981; margin-bottom: 15px; border-radius: 4px;">
          <h3 style="margin: 0; font-size: 18px; color: #ffffff;">${f.name}</h3>
          <p style="margin: 5px 0; color: #94a3b8; font-size: 14px;">New compliance document available for review.</p>
          <a href="${f.url}" style="color: #10b981; font-weight: bold; text-decoration: none; font-size: 14px;">DOWNLOAD DOCUMENT →</a>
        </div>
      `).join('')
    : `<p style="color: #94a3b8; font-style: italic;">No new documents were added in the last 24 hours. Stay tuned!</p>`;

  // 4. Send the Premium Email
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('EMAIL_API_KEY')}`
    },
    body: JSON.stringify({
      from: 'AML_DECODE <onboarding@resend.dev>',
      to: subscribers.map((s: any) => s.email),
      subject: '🚀 Your Daily AML/KYC Job Updates',
      html: `
        <div style="background-color: #030712; color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; border-radius: 8px; max-width: 600px; margin: auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; text-transform: uppercase; letter-spacing: 3px; margin: 0;">AML_DECODE</h1>
            <p style="color: #64748b; font-size: 12px; margin-top: 5px;">FINANCIAL CRIME COMPLIANCE HUB</p>
          </div>

          <p style="color: #e2e8f0; font-size: 16px;">Hello,</p>
          <p style="color: #94a3b8; line-height: 1.6;">Here are the latest job referrals and compliance documents added to the platform in the last 24 hours.</p>
          
          <hr style="border: 0; border-top: 1px solid #1e293b; margin: 30px 0;">
          
          ${fileListHtml}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #1e293b; text-align: center;">
            <p style="font-size: 12px; color: #64748b;">
              You are receiving this because you subscribed to daily alerts at <b>amldecode.com</b>.
            </p>
            <p style="font-size: 12px; color: #64748b; margin-top: 10px;">
              © 2026 AML_DECODE | Designed by Nitesh Mishra
            </p>
          </div>
        </div>
      `,
    })
  });

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
})