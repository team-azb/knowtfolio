import { CircularProgress, Grid, GridProps } from "@mui/material";

type loadingDisplayProps = GridProps & {
  message?: string;
};

/**
 * ローディング中のUI表示のコンポーネント
 */
const LoadingDisplay = (props: loadingDisplayProps) => {
  return (
    <Grid
      item
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      {props.message && <p>{props.message}</p>}
      <CircularProgress />
    </Grid>
  );
};

export default LoadingDisplay;
