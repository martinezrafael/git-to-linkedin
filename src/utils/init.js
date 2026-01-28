import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execSync } from "child_process";

export function setupProject() {
  const ROOT_DIR = process.cwd();
  const configPath = path.join(ROOT_DIR, "git-to-linkedin.config.json");
  const huskyDir = path.join(ROOT_DIR, ".husky");
  const prePushPath = path.join(huskyDir, "pre-push");

  // Nome da pasta atualizado para evitar conflitos
  const imagesDir = path.join(ROOT_DIR, "images-to-linkedin-post");

  console.log(
    chalk.blue.bold("\n🛠️  Iniciando configuração do git-to-linkedin..."),
  );

  // 1. Definições de IA & Personalização
  console.log(
    chalk.white.bold("\n1. Inteligência Artificial & Personalização"),
  );
  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      detailLevel: "médio",
      postLength: "médio",
      tone: "profissional e técnico",
      audience: "desenvolvedores",
      language: "pt-BR",
      useEmojis: true,
      emojiDensity: "baixo",
      useHashtags: true,
      hashtags: {
        mode: "mixed",
        fixed: ["#NodeJS", "#Git", "#Automacao"],
        max: 6,
      },
      useTitle: true,
      useBulletPoints: true,
      maxBulletPoints: 5,
      includeNextSteps: true,
      includeCallToAction: true,
      callToActionText: "O que você faria diferente?",
      technicalDepth: "intermediário",
      focusAreas: ["automação", "integração", "produtividade"],
      avoidTopics: ["marketing", "buzzwords"],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      maxTokens: 600,
      dryRun: false,
      autoPublish: false,
      requireConfirmation: true,
    };

    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log(chalk.green("   ✅ git-to-linkedin.config.json gerado."));
    console.log(
      chalk.gray(
        "      ↳ Este ficheiro controla o tom, emojis, hashtags e profundidade técnica da IA.",
      ),
    );
  } else {
    console.log(
      chalk.yellow(
        "   ℹ️  Configuração existente detectada. (Mantive o ficheiro atual para preservar as tuas regras)",
      ),
    );
  }

  // 2. Ambiente de Mídia (Pasta renomeada)
  console.log(chalk.white.bold("\n2. Processamento de Mídia & Imagens"));
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(
      chalk.green(
        `   ✅ Diretório ${chalk.bold("images-to-linkedin-post")} criado.`,
      ),
    );
    console.log(
      chalk.gray(
        "      ↳ A lib monitoriza esta pasta e anexa automaticamente a última imagem ao post.",
      ),
    );
  }

  // 3. Automação de Hooks
  console.log(chalk.white.bold("\n3. Automação de Fluxo (Git Hooks)"));
  try {
    if (!fs.existsSync(path.join(ROOT_DIR, ".git"))) {
      throw new Error(
        "Pasta .git não encontrada. Inicie um repositório com 'git init' primeiro.",
      );
    }

    execSync("npx husky", { stdio: "ignore" });

    const hookContent = `#!/bin/env sh\n# Vincula o terminal ao script para suportar menus interativos durante o push\nexec < /dev/tty\nnpx git-to-linkedin\n`;

    fs.writeFileSync(prePushPath, hookContent, { mode: 0o755 });

    console.log(
      chalk.green(
        "   ✅ Husky v9 ativado e hook 'pre-push' injetado com sucesso.",
      ),
    );
    console.log(
      chalk.gray(
        "      ↳ O Git agora chamará a IA automaticamente sempre que executares um 'git push'.",
      ),
    );
  } catch (error) {
    console.log(chalk.red(`   ❌ Falha na automação: ${error.message}`));
  }

  // Banner Final de Instruções
  console.log("\n" + chalk.cyan.bold("🚀 Configuração concluída com sucesso!"));
  console.log(
    chalk.blue(
      "──────────────────────────────────────────────────────────────────────────",
    ),
  );
  console.log(chalk.white.bold(" PRÓXIMOS PASSOS FUNDAMENTAIS:"));
  console.log("");
  console.log(chalk.white(` 1. Chaves de API:`));
  console.log(
    chalk.gray(
      `    No seu arquivo ${chalk.bold(".env")}, adicione as variáveis:`,
    ),
  );
  console.log(chalk.yellow(`    LINKEDIN_ACCESS_TOKEN=teu_token_aqui`));
  console.log(chalk.yellow(`    LINKEDIN_CLIENT_ID=teu_client_id_aqui`));
  console.log(
    chalk.yellow(`    LINKEDIN_CLIENT_SECRET=teu_client_secret_aqui`),
  );
  console.log(chalk.yellow(`    LINKEDIN_MEMBER_URN=teu_member_urn_aqui`));
  console.log(chalk.yellow(`    IA_API_KEY=tua_chave_da_ia_aqui`));
  console.log("");
  console.log(chalk.white(` 2. Identidade Visual:`));
  console.log(
    chalk.gray(
      `    Guarda um print do código em: ${chalk.bold("images-to-linkedin-post/")}`,
    ),
  );
  console.log("");
  console.log(chalk.white(` 3. Workflow:`));
  console.log(
    chalk.gray(
      `    Basta rodar ${chalk.bold("git push")}. O menu de publicação surgirá no teu terminal.`,
    ),
  );
  console.log(
    chalk.blue(
      "──────────────────────────────────────────────────────────────────────────\n",
    ),
  );
}
