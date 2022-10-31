import LoadingDisplay from "~/components/atoms/LoadingDisplay";

/**
 * 認証関連のSession情報を読み込んでいる際のページ表示
 */
const LoadingSessionPage = () => {
  return (
    <div style={{ padding: "100px 400px" }}>
      <LoadingDisplay message="認証情報をローディング中" />
    </div>
  );
};

export default LoadingSessionPage;
