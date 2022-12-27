import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import fs from "fs/promises";
import { parse } from "node-html-parser";
import App from "./App";

/**
 * 記事画面のServer-Side Renderingのためにbackendで用いられるhtmlのテンプレートにページのコンテンツ(<App/>)を差し込む関数
 */
const main = async () => {
  // templateのベースとなるReactのビルドで生成されたarticle_template.htmlを読み込む
  const fileBuf = await fs.readFile(`${__dirname}/article_template.html`);
  const document = parse(fileBuf.toString());
  const app = renderToString(
    <StaticRouter location={"/articles/articleId"}>
      <App />
    </StaticRouter>
  );
  document.getElementById("app").innerHTML = app;
  await fs.writeFile(`${__dirname}/article_template.html`, document.toString());
};

main();
