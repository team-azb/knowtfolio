import { CircularProgress, Grid, GridProps } from "@mui/material";

type loadingDisplayProps = GridProps & {
  message?: string;
};

/**
 * ローディング中であることを示すUI表示のコンポーネント
 * @message 表示されるメッセージ
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
