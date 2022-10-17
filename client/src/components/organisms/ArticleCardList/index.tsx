import { useEffect, useState } from "react";
import { searchArticles, SearchResultEntry } from "~/apis/knowtfolio";
import ArticleCard from "../ArticleCard";

const ArticleCardList = () => {
  const [articles, setArticles] = useState<SearchResultEntry[]>([]);
  useEffect(() => {
    (async () => {
      const { results } = await searchArticles();
      setArticles(results);
    })();
  }, []);
  return (
    <ul>
      {articles.map((article) => {
        return <ArticleCard key={article.id} article={article} />;
      })}
    </ul>
  );
};

export default ArticleCardList;
