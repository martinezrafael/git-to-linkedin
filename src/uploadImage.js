import axios from "axios";
import retry from "./retry.js";
import fs from "fs";

// Instância para chamadas da API do LinkedIn (JSON)
const axiosInstance = axios.create({
  timeout: 20000,
  headers: {
    Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
  },
});

async function uploadImage(personUrn, imagePath, linkedinApiUrl) {
  // 1. Registrar o upload
  const registerRes = await retry(() =>
    axiosInstance.post(`${linkedinApiUrl}/assets?action=registerUpload`, {
      registerUploadRequest: {
        owner: personUrn,
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent",
          },
        ],
      },
    }),
  );

  const uploadUrl =
    registerRes.data.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ].uploadUrl;

  const assetUrn = registerRes.data.value.asset;

  // 2. Upload do binário (Aqui estava o erro)
  // O LinkedIn exige o método PUT e o corpo deve ser o Buffer puro da imagem.
  const imageBuffer = fs.readFileSync(imagePath);

  await retry(() =>
    axios.put(uploadUrl, imageBuffer, {
      headers: {
        // Importante: NÃO enviar o Header de Authorization aqui (a URL já é assinada)
        // E NÃO usar a axiosInstance aqui para evitar conflitos de Content-Type
        "Content-Type": "application/octet-stream",
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    }),
  );

  return assetUrn;
}

export default uploadImage;
