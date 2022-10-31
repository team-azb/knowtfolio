import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchArticles, SearchResultEntry } from "~/apis/knowtfolio";
import SearchedArticleCard from "~/components/organisms/cards/SearchedArticleCard";

const SearchResultTable = () => {
  const [searchParams] = useSearchParams();
  const [articles, setArticles] = useState<SearchResultEntry[]>([]);

  useEffect(() => {
    const keywords = searchParams.get("q") || undefined;
    (async () => {
      const { results } = await searchArticles({
        keywords,
        sort_by: "updated_at",
        page_num: 1,
        page_size: 10,
      });
      setArticles(results);
    })();
  }, [searchParams]);

  return (
    <Grid item container spacing={1}>
      {articles.map((article) => {
        return (
          <Grid xs={3} item key={article.id}>
            <SearchedArticleCard article={article} />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default SearchResultTable;
