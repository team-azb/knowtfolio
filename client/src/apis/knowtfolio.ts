import axios from "axios";

export type postArticleForm = {
  content: string;
  title: string;
  token: string;
};

type postArticleResponse = {
  content: string;
  id: string;
  title: string;
};
export const postArticle = async (form: postArticleForm) => {
  const { data } = await axios.post<postArticleResponse>(
    "/api/articles",
    {
      content: form.content,
      title: form.title,
    },
    {
      headers: {
        Authorization: `Bearer ${form.token}`,
      },
    }
  );
  return data;
};

export type updateArticleForm = {
  articleId: string;
} & postArticleForm;
export const putArticle = async (form: updateArticleForm) => {
  await axios.put(
    `/api/articles/${form.articleId}`,
    {
      content: form.content,
      title: form.title,
    },
    {
      headers: {
        Authorization: `Bearer ${form.token}`,
      },
    }
  );
};

type getArticleResponse = {
  id: string;
  content: string;
  title: string;
  owner_address: string;
  owner_id: string;
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
  await axios.post(`/api/nfts/${form.articleId}`, {
    address: form.address,
    signature: form.signature,
  });
};

export type SearchResultEntry = {
  id: string;
  title: string;
  owner_address: string;
};

type searchArticlesResponse = {
  results: SearchResultEntry[];
  total_count: number;
};
type searchQuery = {
  keywords?: string;
  owned_by?: string;
  sort_by?: "created_at" | "updated_at";
  page_num?: number;
  page_size?: number;
};
export const searchArticles = async (queryParams: searchQuery = {}) => {
  const { data } = await axios.get<searchArticlesResponse>("/api/search", {
    params: queryParams,
  });
  return data;
};
