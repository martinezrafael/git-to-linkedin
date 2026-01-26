import fs from "fs";

function loadPromptConfig(configPath) {
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (err) {
    console.error("❌ Erro ao carregar prompt.config.json");
    console.error(err.message);
    process.exit(1);
  }
}

export default loadPromptConfig;
