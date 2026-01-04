import axios from "axios";
const BASE_URL = "http://localhost:8000";

export const fetchRepo = async (repo_url, token) => {
  const res = await axios.post(`${BASE_URL}/fetch-repo`, { repo_url, token });
  return res.data.features;
};

export const generateDraft = async (feature) => {
  const res = await axios.post(`${BASE_URL}/generate-draft/${feature}`);
  return res.data.draft;
};

export const draftAction = async (feature, action, edited_content = "") => {
  const res = await axios.post(`${BASE_URL}/draft-action/${feature}`, {
    action,
    edited_content,
  });
  return res.data;
};

export const finalizeReadme = async () => {
  const res = await axios.post(`${BASE_URL}/finalize-readme`);
  return res.data.readme;
};

export const getDraft = async (feature) => {
  const res = await axios.get(`${BASE_URL}/draft/${feature}`);
  return res.data;
};


export const saveFinalReadme = async (readmeContent) => {
  const res = await axios.post(`${BASE_URL}/save-final-readme`, {
    readme: readmeContent,
  });
  return res.data;
};

export const RefinalizeReadme = async () => {
  const res = await axios.post(`${BASE_URL}/regenerate-readme`);
  return res.data.readme;
}