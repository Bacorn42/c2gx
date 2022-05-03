enum TokenType {
  //Directives
  GAME,
  MAP,
  MUSIC,
  SCRIPT,
  IF,
  ELSEIF,
  ELSE,
  END,
  WHILE,
  FOR,
  FROM,
  TO,
  BY,

  //Data types
  STRING,
  INTEGER,
  VARIABLE,

  //Operators
  EQUAL,
  EQUAL_EQUAL,
  NOT_EQUAL,
  LESS_EQUAL,
  GREATER_EQUAL,
  LESS,
  GREATER,
  AND_AND,
  OR_OR,
  AND,
  OR,
  XOR,
  MOD,
  PLUS,
  MINUS,
  TIMES,
  DIVIDE,

  //Whitespace
  SPACE,
  TAB,
  CARRIAGE_RETURN,
  NEW_LINE,
  COMMENT,

  //Other
  LEFT_PAREN,
  RIGHT_PAREN,
  LABEL,
  GOTO,
  OTHER,

  //End
  EOF,
}

export default TokenType;
