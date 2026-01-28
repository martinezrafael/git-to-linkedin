import getLatestImageFromFolder from "./utils/getLatestImageFromFolder.js";
import generatePostFromDiff from "./ai/generatePostFromDiff.js";
import getPersonUrn from "./linkedin/getPersonUrn.js";
import uploadImage from "./utils/uploadImage.js";
import createPostWithImage from "./linkedin/createPostWithImage.js";
import createTextOnlyPost from "./linkedin/createTextOnlyPost.js";

const DEFAULT_LINKEDIN_API = "https://api.linkedin.com/v2";

export async function generateText(diff, config) {
  if (!diff.trim()) {
    throw new Error("Diff is empty. Nothing to generate text from.");
  }
  if (!config.openAIApiKey) {
    throw new Error("OpenAI API key is required.");
  }

  return generatePostFromDiff(diff, config, config.openAIApiKey);
}

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

  try {
    const personUrn = await getPersonUrn(config.linkedinToken, linkedinApiUrl);

    if (imagePath) {
      try {
        console.log(`DEBUG: Iniciando upload da imagem: ${imagePath}`);
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
        console.warn("Falha ao publicar com imagem, tentando apenas texto...");
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
  } catch (err) {
    console.error("ERRO CRÍTICO NA PUBLICAÇÃO:", {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      apiData: err.response?.data,
      code: err.code,
    });
    throw err;
  }
}
