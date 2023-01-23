import { Editor as TinyMCEEditor } from "tinymce";
import { useCallback, useState } from "react";
import { mintArticleNft, postArticle } from "~/apis/knowtfolio";
import { useNavigate } from "react-router-dom";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";
import ArticleEditor from "~/components/organisms/ArticleEditor";
import { Button, Grid } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
/**
 * 記事の新規作成用のフォーム
 */
import { toast } from "react-toastify";

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

  const onChangeTitleInput = useCallback<
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
      navigate("/mypage");
      toast.success("記事を作成しました。");
    } catch (error) {
      console.error(error);
      toast.error("記事の作成に失敗しました。");
    }
  }, [account, content, navigate, titleInput, web3.eth.personal]);
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
              value={titleInput}
              placeholder="Title"
            />
          </Grid>
        </Grid>
        <Grid item xs={9} container direction="row-reverse">
          <Button
            variant="contained"
            onClick={handlePost}
            style={{ fontSize: "1.4rem" }}
          >
            create article
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

export default NewArticleForm;
