import { Link } from "react-router-dom";

const TopPage = () => {
  return (
    <div>
      <ul>
        <li>
          <Link to={"/signin"}>サインイン</Link>
        </li>
        <li>
          <Link to={"/signup"}>サインアップ</Link>
        </li>
        <li>
          <Link to={"/mypage"}>マイページ</Link>
        </li>
        <li>
          <Link to={"/articles/new"}>記事作成</Link>
        </li>
        <li>
          <Link to={"/articles"}>記事一覧</Link>
        </li>
      </ul>
    </div>
  );
};

export default TopPage;
