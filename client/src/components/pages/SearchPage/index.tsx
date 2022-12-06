import { Grid } from "@mui/material";
import SearchForm from "~/components/organisms/forms/SearchForm";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";
import SearchResultTable from "~/components/organisms/tables/SearchResultTable";

const SearchPage = () => {
  return (
    <HeaderLayout>
      <div style={{ padding: "100px 400px" }}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <h2>Search</h2>
          </Grid>
          <Grid item>
            <SearchForm />
          </Grid>
          <Grid item>
            <SearchResultTable />
          </Grid>
        </Grid>
      </div>
    </HeaderLayout>
  );
};

export default SearchPage;
