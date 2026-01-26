async function retry(fn, retries = 3) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Tentativa ${i + 1}/${retries} falhou`);

      if (err.response) {
        console.error("📛 Status:", err.response.status);
        console.error(
          "📛 Resposta:",
          JSON.stringify(err.response.data, null, 2),
        );
      } else if (err.request) {
        console.error("📛 Conexão encerrada pelo LinkedIn");
      } else {
        console.error("📛 Erro:", err);
      }
    }
  }

  throw lastError;
}

export default retry;
