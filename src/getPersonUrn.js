import axios from "axios";
import retry from "./retry.js";

/**
 * @param {string} accessToken
 * @param {string} linkedinApiUrl
 * @returns {Promise<string>}
 */
async function getPersonUrn(accessToken, linkedinApiUrl) {
  const res = await retry(() =>
    axios.get(`${linkedinApiUrl}/userinfo`, {
      timeout: 20000,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    }),
  );

  return `urn:li:person:${res.data.sub}`;
}

export default getPersonUrn;
