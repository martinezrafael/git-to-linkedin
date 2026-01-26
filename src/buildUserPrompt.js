function buildUserPrompt(cfg, diff) {
  return `
Explique as alterações técnicas com foco em ${cfg.focusAreas.join(", ")}.

Diff do código:
${diff.slice(0, 2000)}
`.trim();
}

export default buildUserPrompt;
