import path from "path";
import { execSync } from "child_process";
import "dotenv/config";
import getLatestImageFromFolder from "./getLatestImageFromFolder.js";
import loadPromptConfig from "./loadPromptConfig.js";
import askConfirmation from "./askConfirmation.js";
import generatePostFromDiff from "./generatePostFromDiff.js";
import getPersonUrn from "./getPersonUrn.js";
import uploadImage from "./uploadImage.js";
import createPostWithImage from "./createPostWithImage.js";
import createTextOnlyPost from "./createTextOnlyPost.js";

const LINKEDIN_API = "https://api.linkedin.com/v2";
const ROOT_DIR = process.cwd();
const IMAGES_DIR = path.join(ROOT_DIR, "src", "images");
const PROMPT_CONFIG_PATH = path.join(
  ROOT_DIR,
  "src",
  "config",
  "prompt.config.json",
);

// Carrega as configurações (garanta que loadPromptConfig retorne o objeto JSON)
const promptConfig = loadPromptConfig(PROMPT_CONFIG_PATH);

async function run() {
  const diff = execSync("git diff --cached").toString();

  if (!diff.trim()) {
    console.log("⚠️ Nenhuma alteração no stage.");
    return;
  }

  console.log("🤖 Gerando post com IA...");

  // CORREÇÃO: Passando promptConfig como argumento para a função
  const postText = await generatePostFromDiff(diff, promptConfig);

  console.log("\n--- 📝 PRÉ-VISUALIZAÇÃO ---\n");
  console.log(postText);
  console.log("\n--------------------------\n");

  const imagePath = getLatestImageFromFolder(IMAGES_DIR);
  console.log(
    "🖼 Imagem encontrada:",
    imagePath || "Nenhuma imagem encontrada.",
  );

  // Lógica de confirmação baseada no config
  if (promptConfig.requireConfirmation && !promptConfig.autoPublish) {
    const answer = await askConfirmation(
      "\n👉 Deseja publicar no LinkedIn? (y/n): ",
    );

    if (!["y", "yes"].includes(answer.toLowerCase())) {
      console.log("❌ Cancelado pelo usuário.");
      return;
    }
  }

  if (promptConfig.dryRun) {
    console.log("🧪 Dry-run ativo. O post não será enviado à API.");
    return;
  }

  console.log("🚀 Publicando...");

  try {
    const personUrn = await getPersonUrn(LINKEDIN_API);

    if (imagePath) {
      try {
        const assetUrn = await uploadImage(personUrn, imagePath, LINKEDIN_API);
        await createPostWithImage(personUrn, postText, assetUrn, LINKEDIN_API);
        console.log("✅ Post publicado com imagem!");
      } catch (err) {
        console.warn(
          "⚠️ Falha ao publicar com imagem. Tentando fallback para texto...",
        );
        await createTextOnlyPost(personUrn, postText, LINKEDIN_API);
        console.log("✅ Post publicado SOMENTE com texto.");
      }
    } else {
      await createTextOnlyPost(personUrn, postText, LINKEDIN_API);
      console.log("✅ Post publicado (Sem imagem disponível).");
    }
  } catch (err) {
    console.error("❌ Erro ao tentar publicar:", err.message);
    console.error(err.response?.data || err.message);
  }
}

run().catch((err) => {
  console.error("🔥 Erro fatal no fluxo principal:", err);
  process.exit(1);
});
