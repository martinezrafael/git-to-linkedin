import getLatestImageFromFolder from "./getLatestImageFromFolder.js";
import generatePostFromDiff from "./generatePostFromDiff.js";
import getPersonUrn from "./getPersonUrn.js";
import uploadImage from "./uploadImage.js";
import createPostWithImage from "./createPostWithImage.js";
import createTextOnlyPost from "./createTextOnlyPost.js";

const DEFAULT_LINKEDIN_API = "https://api.linkedin.com/v2";

/**
 * @param {string} diff
 * @param {object} config
 * @returns {Promise<string>}
 */
export async function generateText(diff, config) {
  if (!diff.trim()) {
    throw new Error("Diff is empty. Nothing to generate text from.");
  }
  if (!config.openAIApiKey) {
    throw new Error("OpenAI API key is required.");
  }

  return generatePostFromDiff(diff, config, config.openAIApiKey);
}

/**
 * @param {string} postText
 * @param {object} config
 * @param {string} config.linkedinToken
 * @param {string} [config.linkedinApiUrl]
 * @param {string} [config.imagesDir]
 * @returns {Promise<void>}
 */
export async function publishPost(postText, config) {
  if (!postText.trim()) {
    throw new Error("Post text is empty. Nothing to publish.");
  }
  if (!config.linkedinToken) {
    throw new Error("LinkedIn token is required.");
  }

  const linkedinApiUrl = config.linkedinApiUrl || DEFAULT_LINKEDIN_API;
  const imagePath = config.imagesDir
    ? getLatestImageFromFolder(config.imagesDir)
    : null;

  const personUrn = await getPersonUrn(config.linkedinToken, linkedinApiUrl);

  if (imagePath) {
    try {
      const assetUrn = await uploadImage(
        config.linkedinToken,
        personUrn,
        imagePath,
        linkedinApiUrl,
      );
      await createPostWithImage(
        config.linkedinToken,
        personUrn,
        postText,
        assetUrn,
        linkedinApiUrl,
      );
    } catch (err) {
      console.warn(
        "Failed to publish with image, falling back to text-only.",
        err,
      );
      await createTextOnlyPost(
        config.linkedinToken,
        personUrn,
        postText,
        linkedinApiUrl,
      );
    }
  } else {
    await createTextOnlyPost(
      config.linkedinToken,
      personUrn,
      postText,
      linkedinApiUrl,
    );
  }
}
