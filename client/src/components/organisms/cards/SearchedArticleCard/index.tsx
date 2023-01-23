import { GridProps } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SearchResultEntry } from "~/apis/knowtfolio";
import ArticleCardBase from "~/components/molecules/ArticleCardBase";
import WalletAddressDisplay from "~/components/organisms/WalletAddressDisplay";

type searchedArticleCardProps = GridProps & {
  article: SearchResultEntry;
};

/**
 * 検索結果を一覧表示するためのカード
 */
const SearchedArticleCard = (props: searchedArticleCardProps) => {
  const navigate = useNavigate();
  return (
    <ArticleCardBase
      title={props.article.title}
      lowerContent={
        <>
          <hr />
          <WalletAddressDisplay address={props.article.owner_address} />
        </>
      }
      onClick={() => navigate(`/articles/${props.article.id}`)}
    />
  );
};

export default SearchedArticleCard;
