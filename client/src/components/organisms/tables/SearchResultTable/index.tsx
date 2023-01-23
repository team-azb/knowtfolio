import { Grid } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchArticles, SearchResultEntry } from "~/apis/knowtfolio";
import SearchedArticleCard from "~/components/organisms/cards/SearchedArticleCard";
import Pagination from "@mui/material/Pagination";

const pageSize = 12;

const SearchResultTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<SearchResultEntry[]>([]);
  const [totalNumOfPage, setTotalNumOfPage] = useState(1);

  const pageNum = useMemo(() => {
    const n = Number(searchParams.get("page"));
    return n > 0 ? n : 1;
  }, [searchParams]);

  useEffect(() => {
    const keywords = searchParams.get("q") || undefined;
    (async () => {
      const { results, total_count } = await searchArticles({
        keywords,
        sort_by: "updated_at",
        page_num: pageNum,
        page_size: pageSize,
      });
      setArticles(results);
      setTotalNumOfPage(Math.ceil(total_count / pageSize));
    })();
  }, [searchParams, pageNum]);

  const changePage = useCallback(
    (_event: React.ChangeEvent<unknown>, page: number) => {
      searchParams.set("page", page.toString());
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams]
  );

  return (
    <Grid item container spacing={2}>
      <Grid item container spacing={1}>
        {articles.map((article) => {
          return (
            <Grid xs={3} item key={article.id}>
              <SearchedArticleCard article={article} />
            </Grid>
          );
        })}
      </Grid>
      <Grid item container justifyContent="center">
        <Pagination
          count={totalNumOfPage}
          color="primary"
          variant="outlined"
          shape="rounded"
          onChange={changePage}
        />
      </Grid>
    </Grid>
  );
};

export default SearchResultTable;
