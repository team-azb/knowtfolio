import { Grid, Pagination } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchArticles, SearchResultEntry } from "~/apis/knowtfolio";
import OwnedArticleCard from "~/components/organisms/cards/OwnedArticleCard";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";

const pageSize = 12;

/**
 * ユーザーが所有している記事を一覧表示できるテーブル
 */
const OwnedArticleTable = () => {
  const {
    attributes: { walletAddress },
  } = useAuthContext();
  const [articles, setArticles] = useState<SearchResultEntry[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalNumOfPage, setTotalNumOfPage] = useState(1);

  const pageNum = useMemo(() => {
    const n = Number(searchParams.get("page"));
    return n > 0 ? n : 1;
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      const { results, total_count } = await searchArticles({
        owned_by: walletAddress,
        sort_by: "updated_at",
        page_num: pageNum,
        page_size: pageSize,
      });
      setArticles(results);
      setTotalNumOfPage(Math.ceil(total_count / pageSize));
    })();
  }, [pageNum, walletAddress]);

  const changePage = useCallback(
    (_event: React.ChangeEvent<unknown>, page: number) => {
      searchParams.set("page", page.toString());
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams]
  );

  return (
    <Grid item container direction="column" spacing={2}>
      <Grid item>
        <h2>Article collection</h2>
        <hr />
      </Grid>
      <Grid item container spacing={2}>
        <Grid item container spacing={1}>
          {articles.map((article) => {
            return (
              <Grid item xs={3} key={article.id}>
                <OwnedArticleCard article={article} />
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
    </Grid>
  );
};

export default OwnedArticleTable;
