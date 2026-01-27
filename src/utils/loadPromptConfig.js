import fs from "fs";

function loadPromptConfig(configPath) {
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (err) {
    console.error("Erro ao carregar prompt.config.json");
    console.error(err.message);
    throw new Error(
      `Failed to load prompt configuration from ${configPath}: ${err.message}`,
    );
  }
}

export default loadPromptConfig;
