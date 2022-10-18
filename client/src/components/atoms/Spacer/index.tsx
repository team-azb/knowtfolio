import { Property } from "csstype";

type spacerProps = {
  height?: Property.Height<string | number>;
};

const Spacer = ({ height }: spacerProps) => {
  return <div style={{ height: height }} />;
};

export default Spacer;
