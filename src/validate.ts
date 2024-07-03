import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { createReadStream } from "fs";

import { parse } from "csv";
import { isLGA, isState } from "./data/raw/nigerian-states.js";

const directory = dirname(fileURLToPath(import.meta.url));
const source = resolve(directory, "./data/raw/nr-100.csv");

type NR = Record<
  | "s/n"
  | "full_name"
  | "title"
  | "dob"
  | "gender"
  | "marital_status"
  | "origin_lga"
  | "origin_state"
  | "appointment_date_first"
  | "rank"
  | "grade_level"
  | "appointment_date_present"
  | "division"
  | "qualifications",
  string
>;

type ValidatorArr<T extends Record<string, string>> = [
  keyof T,
  RegExp | ((value: string, column: keyof T) => boolean),
][];

type ColumnError<T extends Record<string, string>> = {
  column: keyof T;
  line: number;
  value: string;
};

async function validate<T extends Record<string, string>>(
  source: string,
  validator: ValidatorArr<T>,
): Promise<ColumnError<T>[]> {
  return createReadStream(source, { encoding: "utf8" })
    .pipe(parse({ trim: true, info: true, raw: false, columns: true }))
    .reduce(
      (prev, { record, info }: { record: T; info: { lines: number } }) => {
        for (const [column, check] of validator) {
          const value = record[column];

          const valid =
            check instanceof RegExp ? check.test(value) : check(value, column);

          if (!valid) {
            prev.push({
              column,
              value,
              line: info.lines,
            });
          }
        }

        return prev;
      },
      [] as ColumnError<T>[],
    );
}

const isValidDate = (date: string) => !isNaN(new Date(date).getTime());

const results = await validate<NR>(source, [
  ["title", /mr|mrs|miss/i],
  ["gender", /m|f/i],
  ["marital_status", /married|divorced|single/i],
  ["grade_level", /(0?[0-9]|[0-1][0-7]|C)/i],
  ["dob", isValidDate],
  ["appointment_date_first", isValidDate],
  ["appointment_date_present", isValidDate],
  ["full_name", /^[A-Z'-\s]+,(\s([\w'-]+))+$/],
  ["origin_state", isState],
  ["origin_lga", isLGA]
]);

console.table(results.filter(result => result.column === "origin_state" || result.column === "origin_lga"));
