import { Grid } from "@mui/material";
import Spacer from "~/components/atoms/Spacer";
import NewArticleForm from "~/components/organisms/forms/NewArticleForm";

const NewArticlePage = () => {
  return (
    <Grid style={{ padding: "100px 400px" }}>
      <h2>New Aritcle</h2>
      <Spacer height="3rem" />
      <NewArticleForm />
    </Grid>
  );
};

export default NewArticlePage;
