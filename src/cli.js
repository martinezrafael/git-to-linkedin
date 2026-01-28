#!/usr/bin/env node

import path from "path";
import { execSync } from "child_process";
import "dotenv/config";
import loadPromptConfig from "./utils/loadPromptConfig.js";
import askConfirmation from "./utils/askConfirmation.js";
import getLatestImageFromFolder from "./utils/getLatestImageFromFolder.js";
import { generateText, publishPost } from "./index.js";

const ROOT_DIR = process.cwd();
const IMAGES_DIR = path.join(ROOT_DIR, "src", "images");
// Ajustado para src/config conforme a estrutura que você confirmou anteriormente
const PROMPT_CONFIG_PATH = path.join(ROOT_DIR, "config", "prompt.config.json");

async function run() {
  try {
    console.log("🔍 Analisando commits para o push...");

    // Tenta pegar o diff entre a branch atual e a remota
    // Se for o primeiro push da branch, ele pega o diff do último commit
    let diff = "";
    try {
      diff = execSync("git diff @{u}..HEAD").toString();
    } catch (e) {
      // Fallback: Pega as mudanças do último commit se não houver upstream
      diff = execSync("git diff HEAD~1..HEAD").toString();
    }

    if (!diff.trim()) {
      console.log("⚠️ Nenhuma alteração detectada para gerar o post.");
      return;
    }

    const fileConfig = loadPromptConfig(PROMPT_CONFIG_PATH);
    const config = {
      ...fileConfig,
      linkedinToken: process.env.LINKEDIN_ACCESS_TOKEN,
      openAIApiKey: process.env.TEXT_API_KEY,
      imagesDir: IMAGES_DIR,
    };

    console.log("🤖 Gerando post com IA...");
    const postText = await generateText(diff, config);

    console.log("\n--- 📝 PRÉ-VISUALIZAÇÃO DO POST ---");
    console.log(postText);
    console.log("-----------------------------------\n");

    try {
      const latestImagePath = getLatestImageFromFolder(IMAGES_DIR);
      console.log(`📸 Imagem encontrada: ${path.basename(latestImagePath)}`);
    } catch (imageError) {
      console.warn(`⚠️ Aviso: Nenhuma imagem encontrada em ${IMAGES_DIR}`);
    }

    if (config.dryRun) {
      console.log("🚫 Dry-run ativo. O post não será publicado.");
      return;
    }

    // Se estiver no pre-push, precisamos garantir que o prompt aceite input
    if (config.requireConfirmation && !config.autoPublish) {
      const answer = await askConfirmation(
        "\n🚀 Deseja publicar este resumo no LinkedIn agora? (s/n): ",
      );

      if (!["s", "yes", "y"].includes(answer.toLowerCase().trim())) {
        console.log("✅ Push continuará, mas a publicação foi cancelada.");
        return;
      }
    }

    console.log("📤 Publicando no LinkedIn...");
    await publishPost(postText, config);
    console.log("🎉 Post publicado com sucesso!");
  } catch (err) {
    console.error("❌ Erro no processo:", err.message);
    // No hook, sair com 1 cancela o push.
    // Se quiser que o push ocorra mesmo com erro no post, mude para process.exit(0)
    process.exit(1);
  }
}

run();
