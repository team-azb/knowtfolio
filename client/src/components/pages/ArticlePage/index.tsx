import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArticle } from "~/apis/knowtfolio";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";
import Spacer from "~/components/atoms/Spacer";
import { Grid } from "@mui/material";
import ArticleOwnerInfoTable from "~/components/organisms/tables/ArticleOwnerInfoTable";
import NftInfoTable from "~/components/organisms/tables/NftInfoTable";

/**
 * サーバサイドレンダリングされる可能性のある変数の初期値を取得する
 * @param elementId 初期値の取得先になるhtml要素のid
 * @param varNameForTmpl サーバーサイドで埋め込む変数の名前
 * @returns
 */
const initServerSideRenderableValue = (
  elementId: string,
  varNameForTmpl: string = elementId
) => {
  if (__RenderOn__ === "Client") {
    return document.getElementById(elementId)?.innerHTML || "";
  } else {
    // サーバーサイドでのレンダリングのために、goのtemplateの構文を挿入
    return `{{ .${varNameForTmpl} }}`;
  }
};

function ArticlePage() {
  const { articleId } = useParams();
  const [title, setTitle] = useState(initServerSideRenderableValue("title"));
  const [content, setContent] = useState(
    initServerSideRenderableValue("content")
  );
  const [ownerId, setOwnerId] = useState("");

  useEffect(() => {
    (async () => {
      if (articleId) {
        const article = await getArticle(articleId);
        setTitle(article.title);
        setContent(article.content);
        setOwnerId(article.owner_id);
      }
    })();
  }, [articleId]);

  return (
    <HeaderLayout>
      <div style={{ padding: "100px 200px" }}>
        <h1 id="title">{title}</h1>
        <hr />
        <Spacer height={10} />
        <Grid container spacing={5}>
          <Grid item xs={9}>
            <div
              dangerouslySetInnerHTML={{
                __html: content,
              }}
              id="content"
            />
          </Grid>

          <Grid item xs={3}>
            {ownerId && (
              <>
                <ArticleOwnerInfoTable ownerId={ownerId} />
                <hr />
              </>
            )}
            {articleId && (
              <>
                <NftInfoTable articleId={articleId} />
                <hr />
              </>
            )}
          </Grid>
        </Grid>
      </div>
    </HeaderLayout>
  );
}

export default ArticlePage;
