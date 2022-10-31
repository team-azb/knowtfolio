import { Grid } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { searchArticles, SearchResultEntry } from "~/apis/knowtfolio";
import OwnedArticleCard from "~/components/organisms/cards/OwnedArticleCard";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";

/**
 * ユーザーが所有している記事を一覧表示できるテーブル
 */
const OwnedArticleTable = () => {
  const { attributes } = useAuthContext();
  const [articles, setArticles] = useState<SearchResultEntry[]>([]);
  const walletAddress = useMemo(() => {
    const walletAddress = attributes.find(
      (atr) => atr.Name === "custom:wallet_address"
    )?.Value;
    return walletAddress || "";
  }, [attributes]);

  useEffect(() => {
    (async () => {
      const { results } = await searchArticles({
        owned_by: walletAddress,
        sort_by: "updated_at",
        page_num: 1,
        page_size: 10,
      });
      setArticles(results);
    })();
  }, [walletAddress]);

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
