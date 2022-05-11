import React, { ChangeEvent, useState } from "react";
import Compiler from "../../c2gx/compiler/Compiler";
import Editor from "../Editor";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [translatedCode, setTranslatedCode] = useState("");

  const codeHandler = (code: string): void => {
    setCode(code);
  };

  const clickHandler = () => {
    setTranslatedCode(translate(code));
  };

  const translate = (code: string): string => {
    const compiler = new Compiler(code);
    return compiler.compile();
  };

  return (
    <div className="App">
      Hello!
      <div className="App-container">
        <Editor code={code} codeHandler={codeHandler} />
        <button onClick={clickHandler}>Translate</button>
        <textarea value={translatedCode} readOnly={true} className="App-output" />
      </div>
    </div>
  );
}

export default App;
