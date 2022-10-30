import { Editor as TinyMCEEditor } from "tinymce";
import { useCallback, useState } from "react";
import { mintArticleNft, postArticle } from "~/apis/knowtfolio";
import { useNavigate } from "react-router-dom";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";
import ArticleEditor from "~/components/organisms/ArticleEditor";
import { Button, Grid } from "@mui/material";

const NewArticleForm = () => {
  const [content, setContent] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const { web3, account } = useWeb3Context();
  const handleEditorChange = useCallback<
    (value: string, editor: TinyMCEEditor) => void
  >((value) => {
    setContent(value);
  }, []);
  const navigate = useNavigate();

  const changeTitleInput = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setTitleInput(event.target.value);
  }, []);

  const handlePost = useCallback(async () => {
    try {
      const signatureForCreate = await web3.eth.personal.sign(
        "Create Article",
        account,
        ""
      );
      const { id } = await postArticle({
        title: titleInput,
        address: account,
        signature: signatureForCreate,
        content,
      });
      const signatureForMint = await web3.eth.personal.sign(
        "Mint NFT",
        account,
        ""
      );
      await mintArticleNft({
        articleId: id,
        address: account,
        signature: signatureForMint,
      });
      navigate(`/articles/${id}/edit`);
    } catch (error) {
      console.error(error);
      alert("記事の作成に失敗しました。");
    }
  }, [account, content, navigate, titleInput, web3.eth.personal]);
  return (
    <Grid container direction="column" spacing={1}>
      <Grid item container>
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
          value={titleInput}
          placeholder="Title"
        />
      </Grid>
      <Grid item>
        <ArticleEditor onEditorChange={handleEditorChange} value={content} />
      </Grid>
      <Grid item container justifyContent="center">
        <Button
          variant="contained"
          onClick={handlePost}
          style={{ fontSize: "1.4rem" }}
        >
          create article
        </Button>
      </Grid>
    </Grid>
  );
};

export default NewArticleForm;
