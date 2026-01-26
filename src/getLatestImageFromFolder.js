import fs from "fs";
import path from "path";

function getLatestImageFromFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    throw new Error(`Pasta de imagens não encontrada: ${folderPath}`);
  }

  const images = fs
    .readdirSync(folderPath)
    .filter((file) => /^image-\d+\.(png|jpe?g|webp)$/i.test(file))
    .sort((a, b) => {
      const na = Number(a.match(/\d+/)[0]);
      const nb = Number(b.match(/\d+/)[0]);
      return na - nb;
    });

  if (images.length === 0) {
    throw new Error("Nenhuma imagem encontrada no padrão image-X");
  }

  return path.join(folderPath, images.at(-1));
}

export default getLatestImageFromFolder;
