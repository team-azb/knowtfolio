import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArticle } from "~/apis/knowtfolio";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";
import Spacer from "~/components/atoms/Spacer";

function ArticlePage() {
  const { articleId } = useParams();
  const [title, setTitle] = useState(() => {
    if (__isBrowser__) {
      return document.getElementById("title")?.innerHTML || "";
    } else {
      return "{{ .title }}";
    }
  });
  const [content, setContent] = useState(() => {
    if (__isBrowser__) {
      return document.getElementById("content")?.innerHTML || "";
    } else {
      return "{{ .content }}";
    }
  });

  useEffect(() => {
    (async () => {
      if (articleId) {
        const article = await getArticle(articleId);
        setTitle(article.title);
        setContent(article.content);
      }
    })();
  }, [articleId]);

  return (
    <HeaderLayout>
      <div style={{ padding: "100px 400px" }}>
        <h1 id="title">{title}</h1>
        <hr />
        <Spacer height={10} />
        <div
          dangerouslySetInnerHTML={{
            __html: content,
          }}
          id="content"
        />
      </div>
    </HeaderLayout>
  );
}

export default ArticlePage;
