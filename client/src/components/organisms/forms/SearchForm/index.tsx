import { Grid } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * 記事検索に用いるフォーム
 * 入力されたキーワードをURLのクエリパラメータに指定する
 */
const SearchForm = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keywords = useMemo(() => {
    return searchParams.get("q") || "";
  }, [searchParams]);

  const onChangeKeywords = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    (event) => {
      const { value } = event.target;
      if (value) {
        searchParams.set("q", value);
        searchParams.delete("page");
      } else {
        searchParams.delete("q");
      }
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams]
  );
  return (
    <Grid container alignItems="center" spacing={1}>
      <Grid xs={12} item>
        <input
          style={{
            border: "2px solid #eee",
            borderRadius: "0.8rem",
            boxShadow: "none",
            boxSizing: "border-box",
            fontSize: "1.6rem",
            padding: "1rem",
            width: "100%",
          }}
          type="text"
          placeholder="Keywords"
          onChange={onChangeKeywords}
          value={keywords}
        />
      </Grid>
    </Grid>
  );
};

export default SearchForm;
