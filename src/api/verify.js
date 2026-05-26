// api/verify.js
export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { password } = req.body;

  // Compare the input against the environment variable
  // process.env.PARTNER_SECRET is handled automatically by Vercel
  if (password === process.env.PARTNER_SECRET) {
    return res.status(200).json({ authorized: true });
  } else {
    return res.status(401).json({ authorized: false });
  }
}