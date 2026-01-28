import path from "path";
import { execSync } from "child_process";
import "dotenv/config";
import loadPromptConfig from "./loadPromptConfig.js";
import askConfirmation from "./askConfirmation.js";
import getLatestImageFromFolder from "./utils/getLatestImageFromFolder.js";
import { generateText, publishPost } from "./index.js";

const ROOT_DIR = process.cwd();
const IMAGES_DIR = path.join(ROOT_DIR, "src", "images");
const PROMPT_CONFIG_PATH = path.join(
  ROOT_DIR,
  "src",
  "config",
  "prompt.config.json",
);

async function run() {
  try {
    const diff = execSync("git diff --cached").toString();
    if (!diff.trim()) {
      console.log("Nenhuma alteração no stage.");
      return;
    }

    const fileConfig = loadPromptConfig(PROMPT_CONFIG_PATH);
    const config = {
      ...fileConfig,
      linkedinToken: process.env.LINKEDIN_ACCESS_TOKEN,
      openAIApiKey: process.env.TEXT_API_KEY,
      imagesDir: IMAGES_DIR,
    };

    console.log("Gerando post com IA...");
    const postText = await generateText(diff, config);

    console.log("\n--- PRÉ-VISUALIZAÇÃO ---\n");
    console.log(postText);

    try {
      const latestImagePath = getLatestImageFromFolder(IMAGES_DIR);
      console.log(`\n--- IMAGEM PRÉ-VISUALIZAÇÃO ---\n${latestImagePath}`);
    } catch (imageError) {
      console.warn(`Não foi possível pré-visualizar a imagem: ${imageError.message}`);
    }

    if (config.dryRun) {
      console.log(
        "Dry-run ativo. O post gerado não será publicado. Encerrando.",
      );
      return;
    }

    if (config.requireConfirmation && !config.autoPublish) {
      const answer = await askConfirmation(
        "\nDeseja publicar no LinkedIn? (s/n): ",
      );
      if (!["s", "yes"].includes(answer.toLowerCase())) {
        console.log("Publicação cancelada pelo usuário.");
        return;
      }
    }

    console.log("Publicando no LinkedIn...");
    await publishPost(postText, config);
    console.log("Post publicado com sucesso!");
  } catch (err) {
    console.error("Erro no processo:", err.message);
    process.exit(1);
  }
}

run();
