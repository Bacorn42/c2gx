import React, { ChangeEvent, useState } from "react";
import Compiler from "../../c2gx/compiler/Compiler";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [translatedCode, setTranslatedCode] = useState("");

  const changeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
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
      <div className="editor">
        <textarea value={code} onChange={changeHandler} />
        <button onClick={clickHandler}>Translate</button>
        <textarea value={translatedCode} readOnly={true} />
      </div>
    </div>
  );
}

export default App;
