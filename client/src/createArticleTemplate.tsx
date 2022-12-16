import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import fs from "fs/promises";
import { parse } from "node-html-parser";
import App from "./App";

/**
 * 記事画面のssrのためにgoで用いられるhtmlのテンプレートを作成する関数
 * Reactのビルドで作成されるindex.htmlに依存関係があるので注意
 */
const main = async () => {
  // templateのベースとなるReactのビルドで生成されたindex.htmlを読み込む
  const fileBuf = await fs.readFile(`${__dirname}/index.html`);
  const document = parse(fileBuf.toString());
  const app = renderToString(
    <StaticRouter location={"/articles/articleId"}>
      <App />
    </StaticRouter>
  );
  document.getElementById("app").innerHTML = app;
  await fs.writeFile(`${__dirname}/template.html`, document.toString());
};

main();
