import axios from "axios";
import retry from "./retry.js";

const LINKEDIN_API = "https://api.linkedin.com/v2";

const axiosInstance = axios.create({
  timeout: 20000,
  headers: {
    Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
    "X-Restli-Protocol-Version": "2.0.0",
  },
});

async function createTextOnlyPost(personUrn, text, linkedinApiUrl) {
  return retry(() =>
    axiosInstance.post(`${LINKEDIN_API}/ugcPosts`, {
      author: personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  );
}

export default createTextOnlyPost;
