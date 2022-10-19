import { Editor as TinyMCEEditor } from "tinymce";
import { useCallback, useState } from "react";
import { mintArticleNft, postArticle } from "~/apis/knowtfolio";
import { useNavigate } from "react-router-dom";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";
import ArticleEditor from "~/components/organisms/ArticleEditor";

const NewArticlePage = () => {
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
    <>
      <h1>New Aritcle</h1>
      <p>
        title:{" "}
        <input type="text" onChange={changeTitleInput} value={titleInput} />
      </p>
      <ArticleEditor onEditorChange={handleEditorChange} value={content} />
      <p>preview</p>
      <div>{content}</div>
      <button onClick={handlePost}>create article</button>
    </>
  );
};

export default NewArticlePage;
