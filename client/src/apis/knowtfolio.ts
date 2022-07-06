import axios from "axios";

export type postArticleForm = {
  address: string;
  content: string;
  signature: string;
  title: string;
};

type postArticleResponse = {
  content: string;
  id: string;
  title: string;
};
export const postArticle = async (form: postArticleForm) => {
  const { data } = await axios.post<postArticleResponse>("/api/articles", {
    address: form.address,
    content: form.content,
    signature: form.signature,
    title: form.title,
  });
  return data;
};

export type updateArticleForm = {
  articleId: string;
} & postArticleForm;
export const updateArticle = async (form: updateArticleForm) => {
  await axios.put(`/api/articles/${form.articleId}`, {
    address: form.address,
    content: form.content,
    signature: form.signature,
    title: form.title,
  });
};

type getArticleResponse = {
  id: string;
  content: string;
  title: string;
};
export const getArticle = async (articleId: string) => {
  const { data } = await axios.get<getArticleResponse>(
    `/api/articles/${articleId}`
  );
  return data;
};

type mintArticleNftForm = {
  articleId: string;
  address: string;
  signature: string;
};
export const mintArticleNft = async (form: mintArticleNftForm) => {
  await axios.post(`/api/articles/${form.articleId}/nft`, {
    address: form.address,
    signature: form.signature,
  });
};
