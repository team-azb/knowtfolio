import { SearchResultEntry } from "~/apis/knowtfolio";
import WalletAddressDisplay from "~/components/organisms/WalletAddressDisplay";

type artilceCardProps = {
  article: SearchResultEntry;
};

const ArticleCard = ({ article }: artilceCardProps) => {
  return (
    <li>
      <a href={`articles/${article.id}`}>{article.title}</a>
      (owner: <WalletAddressDisplay address={article.owner_address} /> )
    </li>
  );
};

export default ArticleCard;
