import axios from "axios";

export type postArticleForm = {
  address: string;
  content: string;
  signature: string;
  title: string;
};

export const postArticle = async (form: postArticleForm) => {
  await axios.post("/api/articles", {
    address: form.address,
    content: form.content,
    signature: form.signature,
    title: form.title,
  });
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
