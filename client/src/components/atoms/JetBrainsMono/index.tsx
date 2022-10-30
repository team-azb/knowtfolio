/**
 * テキストにJetBrainsMonoフォントを適用するコンポーネント
 * @props pタグと同様
 */
const JetBrainsMono = (
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >
) => {
  return (
    <p
      {...props}
      style={{
        ...props.style,
        fontFamily: "JetBrains Mono",
      }}
    >
      {props.children}
    </p>
  );
};

export default JetBrainsMono;
