import { Editor as TinyMCEEditor } from "tinymce";
import { useCallback, useEffect, useState } from "react";
import { getArticle, mintArticleNft, putArticle } from "~/apis/knowtfolio";
import {
  assertMetamask,
  useWeb3Context,
} from "~/components/organisms/providers/Web3Provider";
import ArticleEditor from "~/components/organisms/ArticleEditor";
import { Button, Grid } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import Switch from "@mui/material/Switch";
import { initDynamodbClient } from "~/apis/dynamodb";
import RequireWeb3Wrapper from "../../RequireWeb3Wrapper";

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
  const [mintSwitchChecked, setMintSwitchChecked] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);
  const handleEditorChange = useCallback<
    (value: string, editor: TinyMCEEditor) => void
  >((value) => {
    setContent(value);
  }, []);
  const { user, session } = useAuthContext();
  const { isConnectedToMetamask, web3, contract, account } = useWeb3Context();
  const dynamodbClient = initDynamodbClient(session.getIdToken().getJwtToken());
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        if (articleId) {
          const { title, content } = await getArticle(articleId);
          setTitle(title);
          setContent(content);
          if (contract) {
            const tokenId = await contract.methods.getTokenId(articleId).call();
            setHasNFT(Number(tokenId) !== 0);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("記事の取得に失敗しました。");
      }
    })();
  }, [articleId, contract]);

  const handleUpdate = useCallback(async () => {
    try {
      await putArticle(
        {
          articleId: articleId || "",
          title,
          content,
        },
        session
      );
      if (mintSwitchChecked) {
        assertMetamask(isConnectedToMetamask);
        await mintArticleNft(dynamodbClient, web3, {
          username: user.getUsername(),
          articleId,
          account,
        });
      }
      navigate(`/users/${user.getUsername()}`);
      toast.success("記事が更新されました。");
    } catch (error) {
      console.error(error);
      toast.error("記事の更新に失敗しました。");
    }
  }, [
    account,
    articleId,
    content,
    dynamodbClient,
    isConnectedToMetamask,
    navigate,
    session,
    mintSwitchChecked,
    title,
    user,
    web3,
  ]);

  const onChangeTitleInput = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setTitle(event.target.value);
  }, []);

  const onChangeNFTSwitch = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setMintSwitchChecked(checked);
    },
    []
  );

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
        <Grid item xs={9} container direction="row-reverse" alignItems="center">
          <Grid item>
            {mintSwitchChecked ? (
              <RequireWeb3Wrapper isConnectedToMetamask={isConnectedToMetamask}>
                <Button
                  variant="contained"
                  onClick={handleUpdate}
                  style={{ fontSize: "1.4rem" }}
                >
                  update article
                </Button>
              </RequireWeb3Wrapper>
            ) : (
              <Button
                variant="contained"
                onClick={handleUpdate}
                style={{ fontSize: "1.4rem" }}
              >
                update article
              </Button>
            )}
          </Grid>
          {!hasNFT && (
            <Grid item>
              <Grid container alignItems="center">
                <label htmlFor="mint">Mint NFT</label>
                <Switch
                  id="mint"
                  checked={mintSwitchChecked}
                  disabled={hasNFT}
                  onChange={onChangeNFTSwitch}
                  inputProps={{ "aria-label": "controlled" }}
                />
              </Grid>
            </Grid>
          )}
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
