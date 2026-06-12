// Proxy upload JSON metadata lên Pinata — JWT chỉ nằm phía server.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.PINATA_JWT) {
    return res.status(500).json({ error: "PINATA_JWT chưa được cấu hình trên server" });
  }

  try {
    const pinataRes = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await pinataRes.json();
    return res.status(pinataRes.status).json(data);
  } catch (error) {
    console.error("IPFS JSON upload proxy error:", error);
    return res.status(502).json({ error: "Không thể upload metadata lên IPFS" });
  }
}
