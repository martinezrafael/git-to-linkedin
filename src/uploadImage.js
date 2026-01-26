import axios from "axios";
import retry from "./retry.js";
import fs from "fs";

/**
 * @param {string} accessToken
 * @param {string} personUrn
 * @param {string} imagePath
 * @param {string} linkedinApiUrl
 * @returns {Promise<string>}
 * @returns {Promise<string>}
 */
async function uploadImage(accessToken, personUrn, imagePath, linkedinApiUrl) {
  const registerRes = await retry(() =>
    axios.post(
      `${linkedinApiUrl}/assets?action=registerUpload`,
      {
        registerUploadRequest: {
          owner: personUrn,
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      },
      {
        timeout: 20000,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
          "Content-Type": "application/json",
        },
      },
    ),
  );

  const uploadUrl =
    registerRes.data.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ].uploadUrl;

  const assetUrn = registerRes.data.value.asset;

  const imageBuffer = fs.readFileSync(imagePath);
  await retry(() =>
    axios.put(uploadUrl, imageBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    }),
  );

  return assetUrn;
}

export default uploadImage;
