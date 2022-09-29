import { useParams } from "react-router-dom";
import { Editor as TinyMCEEditor } from "tinymce";
import { useCallback, useEffect, useState } from "react";
import { getArticle, putArticle } from "~/apis/knowtfolio";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";
import ArticleEditor from "~/components/organisms/ArticleEditor";

const ArticleEditForm = () => {
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

  return (
    <>
      <h1>Edit Article: {articleId}</h1>
      <ArticleEditor onEditorChange={handleEditorChange} value={content} />
      <p>preview</p>
      <div>{content}</div>
      <button onClick={handleUpdate}>update article</button>
    </>
  );
};

export default ArticleEditForm;
