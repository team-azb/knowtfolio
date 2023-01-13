import { Button, GridProps } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SearchResultEntry } from "~/apis/knowtfolio";
import ArticleCardBase from "~/components/molecules/ArticleCardBase";

type ownedArticleCardProps = GridProps & {
  article: SearchResultEntry;
};

/**
 * 所有記事を一覧表示するためのカード
 */
const OwnedArticleCard = (props: ownedArticleCardProps) => {
  const navigate = useNavigate();
  return (
    <ArticleCardBase
      title={props.article.title}
      lowerContent={
        <>
          <hr />
          <Button
            variant="outlined"
            onClick={() => {
              navigate(`/articles/${props.article.id}/edit`);
            }}
          >
            Edit
          </Button>
        </>
      }
      onClick={() => navigate(`/articles/${props.article.id}`)}
    />
  );
};

export default OwnedArticleCard;
