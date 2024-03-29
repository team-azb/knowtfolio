import { Link } from "react-router-dom";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";

const TopPage = () => {
  return (
    <HeaderLayout>
      <ul>
        <li>
          <Link to={"/signin"}>サインイン</Link>
        </li>
        <li>
          <Link to={"/signup"}>サインアップ</Link>
        </li>
        <li>
          <Link to={"/articles/new"}>記事作成</Link>
        </li>
        <li>
          <Link to={"/search"}>記事検索</Link>
        </li>
      </ul>
    </HeaderLayout>
  );
};

export default TopPage;
