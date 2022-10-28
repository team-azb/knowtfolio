import { Property } from "csstype";

type spacerProps = {
  height?: Property.Height<string | number>;
};

/**
 * 指定したheightで縦にスペースをdivタグで作成するコンポーネント
 * @height スペースの高さ
 */
const Spacer = ({ height }: spacerProps) => {
  return <div style={{ height: height }} />;
};

export default Spacer;
