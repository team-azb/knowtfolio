import { Button, Grid, GridProps } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import { SearchResultEntry } from "~/apis/knowtfolio";
import TrancatedText from "~/components/atoms/TruncatedText";

type ownedArticleCardProps = GridProps & {
  article: SearchResultEntry;
};

/**
 * 所有記事を一覧表示するためのカード
 */
const OwnedArticleCard = (props: ownedArticleCardProps) => {
  const navigate = useNavigate();
  return (
    <Grid
      container
      direction="column"
      style={{
        border: `1px solid ${grey[500]}`,
        borderRadius: 8,
        padding: "1rem",
      }}
      {...props}
    >
      <Grid item style={{ height: "10rem" }}>
        <h3 style={{ fontWeight: "normal" }}>
          <TrancatedText str={props.article.title} m={25} n={5} />
        </h3>
      </Grid>
      <Grid item>
        <hr />
        <Button
          variant="outlined"
          onClick={() => navigate(`/articles/${props.article.id}/edit`)}
        >
          Edit
        </Button>
      </Grid>
    </Grid>
  );
};

export default OwnedArticleCard;
