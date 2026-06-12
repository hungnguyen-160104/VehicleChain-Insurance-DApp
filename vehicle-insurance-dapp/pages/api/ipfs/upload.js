// Proxy upload file lên Pinata — JWT chỉ nằm phía server (process.env.PINATA_JWT),
// không còn lộ ra client bundle như NEXT_PUBLIC_* trước đây.
export const config = {
  api: {
    bodyParser: false, // giữ nguyên multipart body để chuyển tiếp
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.PINATA_JWT) {
    return res.status(500).json({ error: "PINATA_JWT chưa được cấu hình trên server" });
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    // Giới hạn 25MB tránh abuse
    if (body.length > 25 * 1024 * 1024) {
      return res.status(413).json({ error: "File quá lớn (tối đa 25MB)" });
    }

    const pinataRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          "content-type": req.headers["content-type"],
        },
        body,
      }
    );

    const data = await pinataRes.json();
    return res.status(pinataRes.status).json(data);
  } catch (error) {
    console.error("IPFS upload proxy error:", error);
    return res.status(502).json({ error: "Không thể upload lên IPFS" });
  }
}
