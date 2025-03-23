export interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  exchangeShortName: string;
  type: string;
}

export type GeographyOption = "US" | "HK" | "China" | "Global";

export type LanguageOption =
  | "English"
  | "SimplifiedChinese"
  | "TraditionalChinese";

export interface ExtractedTicker {
  symbol: string;
  name?: string;
  exchange?: string;
}
