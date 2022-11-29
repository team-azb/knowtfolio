import { GridProps } from "@mui/material";
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
  return (
    <ArticleCardBase
      title={props.article.title}
      lowerContent={
        <>
          <hr />
          <WalletAddressDisplay address={props.article.owner_address} />
        </>
      }
      onClick={() => (location.href = `/articles/${props.article.id}`)}
    />
  );
};

export default SearchedArticleCard;
