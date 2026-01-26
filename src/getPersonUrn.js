import axios from "axios";
import retry from "./retry.js";

const axiosInstance = axios.create({
  timeout: 20000,
  headers: {
    Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
    "X-Restli-Protocol-Version": "2.0.0",
  },
});

async function getPersonUrn(linkedinApiUrl) {
  const res = await retry(() =>
    axiosInstance.get(`${linkedinApiUrl}/userinfo`),
  );

  return `urn:li:person:${res.data.sub}`;
}

export default getPersonUrn;
