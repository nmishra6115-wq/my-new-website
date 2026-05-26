export default function handler(req, res) {
  // Add this line to test if the code runs at all
  console.log("API IS REACHED");
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { password } = req.body;
  const secret = process.env.PARTNER_SECRET;

  // Let's return the secret (only for debugging! Remove this later) 
  // to see what Vercel thinks the secret is.
  if (password === secret) {
    return res.status(200).json({ authorized: true });
  } else {
    return res.status(401).json({ 
      authorized: false, 
      debug: "Secret was " + (secret ? "found" : "missing") 
    });
  }
}