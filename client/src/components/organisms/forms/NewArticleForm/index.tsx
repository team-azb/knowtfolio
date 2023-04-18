import { Editor as TinyMCEEditor } from "tinymce";
import { useCallback, useState } from "react";
import {
  generateSignData,
  mintArticleNft,
  postArticle,
} from "~/apis/knowtfolio";
import { useNavigate } from "react-router-dom";
import {
  assertMetamask,
  useWeb3Context,
} from "~/components/organisms/providers/Web3Provider";
import ArticleEditor from "~/components/organisms/ArticleEditor";
import { Button, Grid } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { toast } from "react-toastify";
import RequireWeb3Wrapper from "~/components/organisms/RequireWeb3Wrapper";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { fetchNonce, initDynamodbClient } from "~/apis/dynamodb";

/**
 * 記事の新規作成用のフォーム
 */
const NewArticleForm = () => {
  const [content, setContent] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const { user, session } = useAuthContext();
  const { isConnectedToMetamask, web3, account } = useWeb3Context();
  const handleEditorChange = useCallback<
    (value: string, editor: TinyMCEEditor) => void
  >((value) => {
    setContent(value);
  }, []);
  const navigate = useNavigate();
  const dynamodbClient = initDynamodbClient(session.getIdToken().getJwtToken());

  const onChangeTitleInput = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setTitleInput(event.target.value);
  }, []);

  const handlePost = useCallback(async () => {
    try {
      const idToken = session.getIdToken().getJwtToken();
      const { id } = await postArticle({
        title: titleInput,
        content,
        token: idToken,
      });

      assertMetamask(isConnectedToMetamask);

      const nonce = await fetchNonce(dynamodbClient, user.getUsername());
      const signatureForMint = await web3.eth.personal.sign(
        generateSignData("Mint NFT", nonce),
        account,
        ""
      );
      // TODO: Make this optional
      await mintArticleNft({
        articleId: id,
        address: account,
        signature: signatureForMint,
      });
      navigate(`/users/${user.getUsername()}`);
      toast.success("記事を作成しました。");
    } catch (error) {
      console.error(error);
      toast.error("記事の作成に失敗しました。");
    }
  }, [
    account,
    content,
    isConnectedToMetamask,
    navigate,
    session,
    titleInput,
    user,
    web3,
  ]);
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
          <RequireWeb3Wrapper isConnectedToMetamask={isConnectedToMetamask}>
            <Button
              variant="contained"
              onClick={handlePost}
              style={{ fontSize: "1.4rem" }}
            >
              create article
            </Button>
          </RequireWeb3Wrapper>
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
