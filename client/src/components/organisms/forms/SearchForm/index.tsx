import { Grid } from "@mui/material";
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Input from "~/components/atoms/search/Input";

const SearchForm = () => {
  const [, setSearchParams] = useSearchParams();

  const onChangeKeywords = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    (event) => {
      const { value } = event.target;
      setSearchParams(value ? { q: value } : {});
    },
    [setSearchParams]
  );
  return (
    <Grid container alignItems="center" spacing={1}>
      <Grid xs={12} item>
        <Input type="text" placeholder="Keywords" onChange={onChangeKeywords} />
      </Grid>
    </Grid>
  );
};

export default SearchForm;
