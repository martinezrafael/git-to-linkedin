import axios from "axios";
import retry from "./retry.js";

const axiosInstance = axios.create({
  timeout: 20000,
  headers: {
    Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
    "X-Restli-Protocol-Version": "2.0.0",
  },
});

async function createPostWithImage(personUrn, text, assetUrn, linkedinApiUrl) {
  return retry(() =>
    axiosInstance.post(`${linkedinApiUrl}/ugcPosts`, {
      author: personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "IMAGE",
          media: [{ status: "READY", media: assetUrn }],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  );
}

export default createPostWithImage;
