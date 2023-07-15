import { Button, Grid } from "@mui/material";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";
import topImage from "~/assets/top.jpeg";

const TopPage = () => {
  return (
    <HeaderLayout>
      <Grid container>
        <Grid
          item
          container
          direction="row-reverse"
          height={500}
          alignItems="center"
          style={{ position: "relative" }}
        >
          <img
            src={topImage}
            alt="top"
            style={{
              opacity: 0.4,
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: -1,
            }}
          />
          <Grid item xs={6} container direction="column" spacing={1}>
            <Grid item>
              <h1 style={{ fontSize: "3.5rem", fontWeight: "bold" }}>
                知識を資産により便利に
              </h1>
            </Grid>
            <Grid item>
              <p style={{ fontSize: "1.8rem" }}>
                あなたが持っている知識を記事に、そして、資産にしましょう。
                <br />
                記事の価値をより上げて、誰かに渡すことで資産を有効活用しましょう。
              </p>
            </Grid>
            <Grid item container spacing={1}>
              <Grid item>
                <Button
                  variant="outlined"
                  style={{ fontSize: "1.8rem", fontWeight: "bold" }}
                >
                  記事を探す
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  style={{ fontSize: "1.8rem", fontWeight: "bold" }}
                >
                  記事を書く
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  style={{ fontSize: "1.8rem", fontWeight: "bold" }}
                >
                  Knowtfolioとは?
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item container></Grid>
      </Grid>
    </HeaderLayout>
  );
};

export default TopPage;
