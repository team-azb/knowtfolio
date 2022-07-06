import { Editor } from "@tinymce/tinymce-react";
import { Editor as TinyMCEEditor } from "tinymce";
import { TINY_MCE_API_KEY } from "~/configs/tinymce";
import { useCallback, useState } from "react";
import { mintArticleNft, postArticle } from "~/apis/knowtfolio";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "~/components/organisms/providers/Web3Provider";

const NewArticlePage = () => {
  const [content, setContent] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const { web3, account } = useWeb3();
  const handleEditorChange = useCallback<
    (a: string, editor: TinyMCEEditor) => void
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
      "MINT NFT",
      account,
      ""
    );
    await mintArticleNft({
      articleId: id,
      address: account,
      signature: signatureForMint,
    });
    navigate(`/artcles/${id}`);
  }, [account, content, navigate, titleInput, web3.eth.personal]);

  return (
    <>
      <h1>New Aritcle</h1>
      <p>
        title:{" "}
        <input type="text" onChange={changeTitleInput} value={titleInput} />
      </p>
      <Editor
        onEditorChange={handleEditorChange}
        value={content}
        apiKey={TINY_MCE_API_KEY}
        init={{
          height: 500,
          menubar: true,
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />
      <p>preview</p>
      <div>{content}</div>
      <button onClick={handlePost}>create article</button>
    </>
  );
};

export default NewArticlePage;
