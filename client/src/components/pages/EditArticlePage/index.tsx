import { useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { Editor as TinyMCEEditor } from "tinymce";
import { TINY_MCE_API_KEY } from "~/configs/tinymce";
import { useCallback, useEffect, useState } from "react";
import { getArticle, updateArticle } from "~/apis/knowtfolio";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";

const EditArticlePage = () => {
  const { articleId } = useParams();
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
      await updateArticle({
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
  return (
    <>
      <h1>Edit Articles: {articleId}</h1>
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
      <button onClick={handleUpdate}>update article</button>
    </>
  );
};

export default EditArticlePage;
