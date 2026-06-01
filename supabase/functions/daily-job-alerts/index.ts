// @ts-nocheck
import { serve } from "std/http/server.ts"
import { createClient } from "supabase-js"

serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const authHeader = `Bearer ${Deno.env.get('EMAIL_API_KEY')}`;
  const resendUrl = 'https://api.resend.com/emails';

  // Parse the incoming request body
  let payload = {};
  try {
    payload = await req.json();
  } catch (e) {
    // If no JSON body, we assume it's a manual or scheduled GET/POST trigger
  }

  // --- 1. WELCOME EMAIL LOGIC (FOR NEW SIGN-UPS) ---
  if (payload.type === 'INSERT' && payload.table === 'subscribers') {
    const newUserEmail = payload.record.email;

    const welcomeResponse = await fetch(resendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify({
        from: 'AML_DECODE <alerts@amldecode.in>',
        to: [newUserEmail],
        subject: 'Welcome to AML_DECODE: Your Compliance Journey Starts Here 🚀',
        html: `
          <div style="background-color: #030712; color: #f8fafc; font-family: sans-serif; padding: 40px; border-radius: 8px; max-width: 600px; margin: auto;">
            <h1 style="color: #10b981;">Welcome to AML_DECODE</h1>
            <p>Hi there,</p>
            <p>Thank you for joining our community! You are now set to receive daily alerts on <b>KYC, AML, and Transaction Monitoring</b> job referrals.</p>
            <p>Expect your first batch of alerts tomorrow morning.</p>
            <hr style="border-top: 1px solid #1e293b; margin: 20px 0;">
            <p style="font-size: 12px; color: #64748b;">© 2026 AML_DECODE | Founder: Nitesh Mishra</p>
          </div>
        `,
      })
    });

    return new Response(JSON.stringify({ message: "Welcome email sent" }), { status: 200 });
  }

  // --- 2. DAILY ALERT LOGIC (SCHEDULED RUN) ---
  const { data: subscribers } = await supabase.from('subscribers').select('email');
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: newFiles } = await supabase.from('partner_files').select('*').gt('created_at', yesterday);

  if (!subscribers || subscribers.length === 0) {
    return new Response(JSON.stringify({ message: "No subscribers" }), { status: 200 });
  }

  const fileListHtml = newFiles && newFiles.length > 0 
    ? newFiles.map((f: any) => `
        <div style="background: #0f172a; padding: 20px; border-left: 4px solid #10b981; margin-bottom: 15px; border-radius: 4px;">
          <h3 style="margin: 0; font-size: 18px; color: #ffffff;">${f.name}</h3>
          <p style="margin: 5px 0; color: #94a3b8; font-size: 14px;">New compliance document available for review.</p>
          <a href="${f.url}" style="color: #10b981; font-weight: bold; text-decoration: none; font-size: 14px;">DOWNLOAD DOCUMENT →</a>
        </div>
      `).join('')
    : `<p style="color: #94a3b8; font-style: italic;">No new documents were added in the last 24 hours. Stay tuned!</p>`;

 await fetch(resendUrl, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': authHeader 
  },
  body: JSON.stringify({
    from: 'AML_DECODE <alerts@amldecode.in>',
    to: ['alerts@amldecode.in'], // Primary recipient is you
    bcc: subscribers.map((s: any) => s.email), // Hides all subscribers from each other
    subject: '🚀 Your Daily AML/KYC Job Updates',
    html: `
      <div style="background-color: #030712; color: #f8fafc; font-family: sans-serif; padding: 40px; border-radius: 8px; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; text-transform: uppercase; letter-spacing: 3px; margin: 0;">AML_DECODE</h1>
          <p style="color: #64748b; font-size: 12px; margin-top: 5px;">FINANCIAL CRIME COMPLIANCE HUB</p>
        </div>
        
        <p style="color: #e2e8f0; font-size: 16px;">Hello,</p>
        <p style="color: #94a3b8; line-height: 1.6;">Latest compliance job referrals and documents are now live on the portal.</p>
        
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 30px 0;">
        
        ${newFiles && newFiles.length > 0 
          ? newFiles.map((f: any) => `
              <div style="background: #0f172a; padding: 20px; border-left: 4px solid #10b981; margin-bottom: 15px; border-radius: 4px;">
                <h3 style="margin: 0; font-size: 18px; color: #ffffff;">${f.name}</h3>
                <p style="margin: 5px 0; color: #94a3b8; font-size: 14px;">Available for review.</p>
                <a href="https://amldecode.in" style="color: #10b981; font-weight: bold; text-decoration: none; font-size: 14px;">VIEW ON WEBSITE →</a>
              </div>
            `).join('')
          : '<p style="color: #94a3b8;">No new updates today. Check back tomorrow!</p>'}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #1e293b; text-align: center;">
          <p style="font-size: 12px; color: #64748b;">
            You are receiving this because you subscribed to daily alerts at <b>amldecode.in</b>.
          </p>
          <p style="font-size: 12px; color: #64748b; margin-top: 10px;">
            © 2026 AML_DECODE | Marathahalli, Bengaluru
          </p>
        </div>
      </div>
    `,
  })
});

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
})