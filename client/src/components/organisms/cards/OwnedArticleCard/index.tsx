import { Button, Grid, GridProps } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchResultEntry } from "~/apis/knowtfolio";
import NftLinkButton from "~/components/atoms/NftLinkButton";
import ArticleCardBase from "~/components/molecules/ArticleCardBase";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";

type ownedArticleCardProps = GridProps & {
  article: SearchResultEntry;
};

/**
 * 所有記事を一覧表示するためのカード
 */
const OwnedArticleCard = (props: ownedArticleCardProps) => {
  const { isConnectedToMetamask, contract } = useWeb3Context();
  const [tokenId, setTokenId] = useState<number>();

  useEffect(() => {
    (async () => {
      if (isConnectedToMetamask) {
        const resp = await contract.methods.getTokenId(props.article.id).call();
        resp > 0 && setTokenId(resp);
      }
    })();
  }, [contract?.methods, isConnectedToMetamask, props.article.id]);

  const navigate = useNavigate();
  return (
    <ArticleCardBase
      title={props.article.title}
      lowerContent={
        <>
          <hr />
          <Grid container>
            <Button
              variant="outlined"
              onClick={() => {
                navigate(`/articles/${props.article.id}/edit`);
              }}
            >
              Edit
            </Button>
            {tokenId && (
              <NftLinkButton tokenId={tokenId} style={{ marginLeft: "auto" }}>
                NFT id: {tokenId}
              </NftLinkButton>
            )}
          </Grid>
        </>
      }
      onClick={() => navigate(`/articles/${props.article.id}`)}
    />
  );
};

export default OwnedArticleCard;
