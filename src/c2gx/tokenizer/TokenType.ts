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
  AND_EQUAL,
  OR_EQUAL,
  XOR_EQUAL,
  MOD_EQUAL,
  PLUS_EQUAL,
  MINUS_EQUAL,
  TIMES_EQUAL,
  DIVIDE_EQUAL,

  //Whitespace
  SPACE,
  TAB,
  CARRIAGE_RETURN,
  NEW_LINE,
  COMMENT,

  //Other
  LEFT_PAREN,
  RIGHT_PAREN,
  COLON,
  LABEL,
  GOTO,
  OTHER,

  //End
  EOF,
}

export default TokenType;
