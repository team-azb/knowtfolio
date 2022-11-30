import { Editor as TinyMCEEditor } from "tinymce";
import { useCallback, useEffect, useState } from "react";
import { getArticle, putArticle } from "~/apis/knowtfolio";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";
import ArticleEditor from "~/components/organisms/ArticleEditor";
import { Button, Grid } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { useNavigate } from "react-router-dom";

type editArticleFormProps = {
  articleId: string;
};

/**
 * 記事の編集を行うためのフォーム
 * @articleId 編集を行う記事のid
 */
const EditArticleForm = ({ articleId }: editArticleFormProps) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const handleEditorChange = useCallback<
    (value: string, editor: TinyMCEEditor) => void
  >((value) => {
    setContent(value);
  }, []);
  const { web3, account } = useWeb3Context();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        if (articleId) {
          const { title, content } = await getArticle(articleId);
          setTitle(title);
          setContent(content);
        }
      } catch (error) {
        console.error(error);
        alert("記事の取得に失敗しました。");
      }
    })();
  }, [articleId]);

  const handleUpdate = useCallback(async () => {
    try {
      const signature = await web3.eth.personal.sign(
        "Update Article",
        account,
        ""
      );
      await putArticle({
        articleId: articleId || "",
        title,
        content,
        address: account,
        signature,
      });
    } catch (error) {
      console.error(error);
      alert("記事の更新に失敗しました。");
    }
  }, [account, articleId, content, title, web3.eth.personal]);

  const onChangeTitleInput = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setTitle(event.target.value);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        inset: 0,
      }}
    >
      <Grid container direction="row" padding={1}>
        <Grid item container xs={3} alignItems="center" spacing={1}>
          <Grid item style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
            <ArrowBackIosNewRoundedIcon fontSize="large" />
          </Grid>
          <Grid item flexGrow={1}>
            <input
              style={{
                border: "2px solid #eee",
                borderRadius: "0.8rem",
                boxShadow: "none",
                boxSizing: "border-box",
                fontSize: "1.8rem",
                padding: "1rem",
                width: "100%",
              }}
              type="text"
              onChange={onChangeTitleInput}
              value={title}
              placeholder="Title"
            />
          </Grid>
        </Grid>
        <Grid item xs={9} container direction="row-reverse">
          <Button
            variant="contained"
            onClick={handleUpdate}
            style={{ fontSize: "1.4rem" }}
          >
            update article
          </Button>
        </Grid>
      </Grid>
      <Grid flexGrow={1}>
        <ArticleEditor
          onEditorChange={handleEditorChange}
          value={content}
          height="100%"
        />
      </Grid>
    </div>
  );
};

export default EditArticleForm;