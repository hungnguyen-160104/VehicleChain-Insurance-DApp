import toast from "react-hot-toast";

// Upload đi qua API route nội bộ (/api/ipfs/*) — Pinata JWT chỉ nằm phía server
// (biến môi trường PINATA_JWT, KHÔNG dùng NEXT_PUBLIC_ để tránh lộ key ra client).

export const uploadToPinata = async (file, metadata = {}) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const pinataMetadata = JSON.stringify({
      name: metadata.name || file.name,
      keyvalues: metadata.keyvalues || {},
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", pinataOptions);

    const res = await fetch("/api/ipfs/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const resData = await res.json();
    return {
      success: true,
      ipfsHash: resData.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`,
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    toast.error("Failed to upload file to IPFS");
    return {
      success: false,
      error: error.message,
    };
  }
};

export const uploadJSONToPinata = async (
  jsonData,
  filename = "metadata.json"
) => {
  try {
    const res = await fetch("/api/ipfs/upload-json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name: filename,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const resData = await res.json();
    return {
      success: true,
      ipfsHash: resData.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`,
    };
  } catch (error) {
    console.error("Error uploading JSON to Pinata:", error);
    toast.error("Failed to upload metadata to IPFS");
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getFromIPFS = async (hash) => {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    return null;
  }
};
