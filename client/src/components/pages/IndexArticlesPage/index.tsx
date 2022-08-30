import { useEffect, useState } from "react";
import { searchArticles, SearchResultEntry } from "~/apis/knowtfolio";
import { truncate } from "./helper";

const IndexArticlesPage = () => {
  const [articles, setArticles] = useState<SearchResultEntry[]>([]);
  useEffect(() => {
    (async () => {
      const { results } = await searchArticles();
      setArticles(results);
    })();
  }, []);

  return (
    <>
      <h1>articles</h1>
      <ul>
        {articles.map((article) => {
          return (
            <li key={article.id}>
              <a href={`articles/${article.id}`}>{article.title}</a>
              (owner: <strong>{truncate(article.owner_address, 8, 4)}</strong>)
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default IndexArticlesPage;
