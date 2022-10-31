/**
 * trancate long string
 * @param str original string
 * @param m Display the first m characters
 * @param n Display the last n characters
 * @returns truncated string
 */
const truncate = (str: string, m: number, n: number) => {
  return str.length > m + n
    ? str.slice(0, m - 1) + "..." + str.slice(-n, str.length)
    : str;
};

type trancatedTextProps = {
  str: string;
  m: number;
  n: number;
};
/**
 * 長いテキストを途中短縮して表示するコンポーネント
 * @str テキスト
 * @m 表示する最初のm文字
 * @n 表示する最後のn文字
 */
const TrancatedText = ({ str, m, n }: trancatedTextProps) => {
  return <>{truncate(str, m, n)}</>;
};

export default TrancatedText;
