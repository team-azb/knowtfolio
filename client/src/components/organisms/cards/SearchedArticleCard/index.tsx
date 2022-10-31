import { Grid, GridProps } from "@mui/material";
import { grey } from "@mui/material/colors";
import { SearchResultEntry } from "~/apis/knowtfolio";
import TrancatedText from "~/components/atoms/TruncatedText";
import WalletAddressDisplay from "~/components/organisms/WalletAddressDisplay";

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
      <Grid
        item
        style={{ height: "10rem", cursor: "pointer" }}
        onClick={() => (location.href = `/articles/${props.article.id}`)}
      >
        <h3 style={{ fontWeight: "normal" }}>
          <TrancatedText str={props.article.title} m={25} n={5} />
        </h3>
      </Grid>
      <Grid item>
        <hr />
        <WalletAddressDisplay address={props.article.owner_address} />
      </Grid>
    </Grid>
  );
};

export default SearchedArticleCard;
