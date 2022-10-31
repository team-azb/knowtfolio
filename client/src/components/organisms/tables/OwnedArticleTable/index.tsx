import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { searchArticles, SearchResultEntry } from "~/apis/knowtfolio";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";
import OwnedArticleCard from "~/components/organisms/cards/OwnedArticleCard";

/**
 * ユーザーが所有している記事を一覧表示できるテーブル
 */
const OwnedArticleTable = () => {
  const { account } = useWeb3Context();
  const [articles, setArticles] = useState<SearchResultEntry[]>([]);
  useEffect(() => {
    (async () => {
      const { results } = await searchArticles({
        owned_by: account,
        sort_by: "updated_at",
        page_num: 1,
        page_size: 10,
      });
      setArticles(results);
    })();
  }, [account]);

  return (
    <Grid item container direction="column" spacing={2}>
      <Grid item>
        <h2>Article collection</h2>
        <hr />
      </Grid>
      <Grid item container spacing={1}>
        {articles.map((article) => {
          return (
            <Grid item xs={3} key={article.id}>
              <OwnedArticleCard article={article} />
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
};

export default OwnedArticleTable;
