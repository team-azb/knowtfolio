import axios from "axios";
import { CognitoUserSession } from "amazon-cognito-identity-js";
import { sessionToHeader } from "~/apis/cognito";
import { fetchNonce } from "./dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import Web3 from "web3";

export type postArticleForm = {
  content: string;
  title: string;
};

type postArticleResponse = {
  content: string;
  id: string;
  title: string;
};
export const postArticle = async (
  form: postArticleForm,
  session: CognitoUserSession
) => {
  const { data } = await axios.post<postArticleResponse>(
    "/api/articles",
    {
      content: form.content,
      title: form.title,
    },
    {
      headers: sessionToHeader(session),
    }
  );
  return data;
};

export type updateArticleForm = {
  articleId: string;
} & postArticleForm;
export const putArticle = async (
  form: updateArticleForm,
  session: CognitoUserSession
) => {
  await axios.put(
    `/api/articles/${form.articleId}`,
    {
      content: form.content,
      title: form.title,
    },
    {
      headers: sessionToHeader(session),
    }
  );
};

type getArticleResponse = {
  id: string;
  content: string;
  title: string;
  owner_address?: string;
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
  username: string;
  account: string;
};
export const mintArticleNft = async (
  dynamodbClient: DynamoDBClient,
  web3: Web3,
  form: mintArticleNftForm
) => {
  const nonce = await fetchNonce(dynamodbClient, form.username);
  const signatureForMint = await web3.eth.personal.sign(
    generateSignData("Mint NFT", nonce),
    form.account,
    ""
  );
  await axios.post(`/api/nfts/${form.articleId}`, {
    address: form.account,
    signature: signatureForMint,
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

const generateSignData = (message: string, nonce: string) => {
  return `${message}\n(nonce: ${nonce})`;
};
