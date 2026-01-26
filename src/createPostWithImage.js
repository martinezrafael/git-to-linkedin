import axios from "axios";
import retry from "./retry.js";

/**
 * @param {string} accessToken
 * @param {string} personUrn
 * @param {string} text
 * @param {string} assetUrn
 * @param {string} linkedinApiUrl
 * @returns {Promise<any>}
 */
async function createPostWithImage(
  accessToken,
  personUrn,
  text,
  assetUrn,
  linkedinApiUrl,
) {
  return retry(() =>
    axios.post(
      `${linkedinApiUrl}/ugcPosts`,
      {
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
      },
      {
        timeout: 20000,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      },
    ),
  );
}

export default createPostWithImage;
