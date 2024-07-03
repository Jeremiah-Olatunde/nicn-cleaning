import chalk from "chalk";

import Data from "./data/raw/nigerian-states.js";

outer: for (const [state, lgas] of Object.entries(Data)) {
  const formatState = /$[A-Z][a-z]+\s?[A-Z][a-z]]$/;

  if (formatState.test(state)) {
    console.log(chalk.bgRed("invalid state"), chalk.red(state));
  }

  for (const lga of lgas) {
    /**
     *    |------------x------------|------y-----|------------x------------|
     * /^([A-Z][a-z]+('[A-Z]?[a-z]+)?(\s|\/|-))*?[A-Z][a-z]+('[A-Z]?[a-z]+)?$/
     * 
     * x
     * ensure title case
     * capital letter at string start, after apostrophe, / or space
     * ('[A-Z]?[a-z]+)? allows optional capital letter after ' (Mai'Adua, Jama'are)
     * 
     * y
     * allows /, the space or - to seperate words
     * caps can come only after these separators or string start
     * */
    const formatLGA = /^([A-Z][a-z]+('[A-Z]?[a-z]+)?(\s|\/|-))*?[A-Z][a-z]+('[A-Z]?[a-z]+)?$/;

    if (!formatLGA.test(lga)) {
      console.log(chalk.bgRed("invalid lga"), chalk.red(lga));
      break outer;
    };
  }
}