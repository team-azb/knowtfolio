import { Grid, GridProps } from "@mui/material";
import { grey } from "@mui/material/colors";
import { SearchResultEntry } from "~/apis/knowtfolio";
import TrancatedText from "~/components/atoms/TruncatedText";

type searchedArticleCardProps = GridProps & {
  article: SearchResultEntry;
};

const SearchedArticleCard = (props: searchedArticleCardProps) => {
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
        
      </Grid>
    </Grid>
  );
};

export default SearchedArticleCard;
