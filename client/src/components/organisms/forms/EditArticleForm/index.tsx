import { Editor as TinyMCEEditor } from "tinymce";
import { useCallback, useEffect, useState } from "react";
import { getArticle, putArticle } from "~/apis/knowtfolio";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";
import ArticleEditor from "~/components/organisms/ArticleEditor";
import { Button, Grid } from "@mui/material";

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

  const changeTitleInput = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setTitle(event.target.value);
  }, []);

  return (
    <Grid item container direction="column" spacing={1}>
      <Grid item>
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
          onChange={changeTitleInput}
          value={title}
          placeholder="Title"
        />
      </Grid>
      <Grid item>
        <ArticleEditor onEditorChange={handleEditorChange} value={content} />
      </Grid>
      <Grid item container justifyContent="center">
        <Button
          variant="contained"
          onClick={handleUpdate}
          style={{ fontSize: "1.4rem" }}
        >
          update article
        </Button>
      </Grid>
    </Grid>
  );
};

export default EditArticleForm;
