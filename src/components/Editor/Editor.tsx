import React, { ChangeEvent, UIEvent, useRef, useState } from "react";
import gameVariables from "../../c2gx/compiler/gameVariables";
import Token from "../../c2gx/tokenizer/Token";
import Tokenizer from "../../c2gx/tokenizer/Tokenizer";
import TokenType from "../../c2gx/tokenizer/TokenType";
import "./Editor.css";

interface Props {
  code: string;
  codeHandler: (code: string) => void;
}

function Editor({ code, codeHandler }: Props) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [scrollAmount, setScrollAmount] = useState(0);
  const textAreaElement = useRef<HTMLTextAreaElement>(null);
  const containerElement = useRef<HTMLDivElement>(null);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    codeHandler(e.target.value);
    setTokens(new Tokenizer(e.target.value).getTokens());
  };

  const handleScroll = (e: UIEvent<HTMLElement>) => {
    const scroll = (e.target as HTMLElement).scrollLeft;
    setScroll(scroll);
  };

  const setScroll = (scroll: number) => {
    setScrollAmount(scroll);
    if (textAreaElement.current) {
      textAreaElement.current.scrollLeft = scroll;
    }
    if (containerElement.current) {
      containerElement.current.scrollLeft = scroll;
    }
  };

  const getTokenClassName = (token: Token) => {
    if (token.type === TokenType.VARIABLE) {
      if (gameVariables.includes(token.lexeme)) {
        return "Editor-GAME_VARIABLE";
      }
    }
    return `Editor-${token.typeStr}`;
  };

  const getLines = () => {
    if (tokens.length === 0) {
      return 1;
    }
    return tokens[tokens.length - 1].line;
  };

  return (
    <div className="Editor" onScroll={handleScroll} ref={containerElement}>
      <div className="Editor-container">
        <div className="Editor-lines">
          {[...Array(getLines())].map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={handleChange}
          onScroll={handleScroll}
          spellCheck={false}
          wrap="off"
          className="Editor-textarea Editor-style"
          ref={textAreaElement}
          style={{ left: 60 + scrollAmount }}
        ></textarea>
        <pre className="Editor-display Editor-style" style={{ left: 60 + scrollAmount }}>
          {tokens.map((t, i) => (
            <span key={i} className={getTokenClassName(t)}>
              {t.lexeme}
            </span>
          ))}
        </pre>
      </div>
    </div>
  );
}

export default Editor;
