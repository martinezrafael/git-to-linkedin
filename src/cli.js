#!/usr/bin/env node

import path from "path";
import { execSync } from "child_process";
import "dotenv/config";
import chalk from "chalk";
import loadPromptConfig from "./utils/loadPromptConfig.js";
import askConfirmation from "./utils/askConfirmation.js";
import getLatestImageFromFolder from "./utils/getLatestImageFromFolder.js";
import { generateText, publishPost } from "./index.js";

const ROOT_DIR = process.cwd();
const IMAGES_DIR = path.join(ROOT_DIR, "src", "images");
const PROMPT_CONFIG_PATH = path.join(ROOT_DIR, "config", "prompt.config.json");

async function run() {
  try {
    console.log(chalk.blue.bold("\n🔍 Analisando commits para o push..."));

    let diff = "";
    try {
      diff = execSync("git diff @{u}..HEAD").toString();
    } catch (e) {
      diff = execSync("git diff HEAD~1..HEAD").toString();
    }

    if (!diff.trim()) {
      console.log(
        chalk.yellow("⚠️  Nenhuma alteração detectada para gerar o post."),
      );
      return;
    }

    const fileConfig = loadPromptConfig(PROMPT_CONFIG_PATH);
    const config = {
      ...fileConfig,
      linkedinToken: process.env.LINKEDIN_ACCESS_TOKEN,
      openAIApiKey: process.env.TEXT_API_KEY,
      imagesDir: IMAGES_DIR,
    };

    console.log(chalk.magenta("🤖 Gerando post com IA..."));
    const postText = await generateText(diff, config);

    console.log(chalk.cyan.bold("\n--- 📝 PRÉ-VISUALIZAÇÃO DO POST ---"));
    console.log(chalk.white(postText));
    console.log(chalk.cyan.bold("-----------------------------------\n"));

    try {
      const latestImagePath = getLatestImageFromFolder(IMAGES_DIR);
      console.log(
        chalk.green(
          `📸 Imagem encontrada: ${chalk.underline(path.basename(latestImagePath))}`,
        ),
      );
    } catch (imageError) {
      console.warn(
        chalk.yellow(`⚠️  Aviso: Nenhuma imagem encontrada em ${IMAGES_DIR}`),
      );
    }

    if (config.dryRun) {
      console.log(
        chalk.bgWhite.black(" 🚫 Dry-run ativo. O post não será publicado. "),
      );
      return;
    }

    // --- NOVO MENU DE OPÇÕES ---
    console.log(chalk.white.bold("O que deseja fazer?"));
    console.log(
      chalk.white(
        `1. 🚀 ${chalk.bold("Publicar")} no LinkedIn e fazer o ${chalk.bold("Push")}`,
      ),
    );
    console.log(
      chalk.white(`2. 📱 ${chalk.bold("Publicar")} apenas no LinkedIn`),
    );
    console.log(
      chalk.white(`3. ⬆️  Fazer ${chalk.bold("apenas o Push")} sem publicar`),
    );
    console.log(
      chalk.white(`0. ❌ ${chalk.bold("Cancelar tudo")} (para o push)`),
    );

    const choice = await askConfirmation(
      chalk.yellowBright.bold("\nEscolha uma opção (1-3 ou 0): "),
    );

    switch (choice.trim()) {
      case "1":
        console.log(chalk.blueBright("\n📤 Publicando no LinkedIn..."));
        await publishPost(postText, config);
        console.log(
          chalk.green.bold("🎉 Post publicado! Prosseguindo com o push...\n"),
        );
        process.exit(0); // Sucesso para o Git: Push continua
        break;

      case "2":
        console.log(chalk.blueBright("\n📤 Publicando apenas no LinkedIn..."));
        await publishPost(postText, config);
        console.log(chalk.green.bold("🎉 Post publicado com sucesso!"));
        console.log(
          chalk.yellow("⚠️  Push cancelado conforme solicitado (Opção 2)."),
        );
        process.exit(1); // "Erro" para o Git: Push cancelado
        break;

      case "3":
        console.log(
          chalk.gray(
            "\n✅ Pulando publicação. Prosseguindo apenas com o push...",
          ),
        );
        process.exit(0); // Sucesso para o Git: Push continua
        break;

      case "0":
        console.log(
          chalk.red("\n❌ Operação cancelada. O push não será realizado."),
        );
        process.exit(1); // "Erro" para o Git: Push cancelado
        break;

      default:
        console.log(
          chalk.red("\n🚫 Opção inválida. Operação abortada por segurança."),
        );
        process.exit(1);
    }
  } catch (err) {
    console.error(
      chalk.red.bold("\n❌ Erro no processo:"),
      chalk.red(err.message),
    );
    process.exit(1);
  }
}

run();
