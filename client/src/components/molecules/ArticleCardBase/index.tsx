import { Grid, GridProps } from "@mui/material";
import { grey } from "@mui/material/colors";
import TrancatedText from "~/components/atoms/TruncatedText";

type articleCardProps = GridProps & {
  title: string;
  lowerContent: JSX.Element;
  onClick: React.MouseEventHandler<HTMLDivElement>;
};

const ArticleCardBase = (props: articleCardProps) => {
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
        onClick={props.onClick}
      >
        <h3 style={{ fontWeight: "normal" }}>
          <TrancatedText text={props.title} m={25} n={5} />
        </h3>
      </Grid>
      <Grid item>{props.lowerContent}</Grid>
    </Grid>
  );
};

export default ArticleCardBase;
