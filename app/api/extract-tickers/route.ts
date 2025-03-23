import { NextResponse } from "next/server";
import { extractTickers } from "@/services/nlpService";
// import { getAllStocks } from "@/services/fmpService";
import { GeographyOption, LanguageOption } from "@/types";

export async function POST(request: Request) {
  try {
    const { query, geography, language } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "请提供查询文本" }, { status: 400 });
    }

    // 获取所有股票数据 - 目前未使用，但保留供未来扩展
    // const stocks = await getAllStocks();

    // 提取股票代码
    const tickers = await extractTickers(
      query,
      geography as GeographyOption,
      language as LanguageOption
    );

    return NextResponse.json({ tickers });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "处理请求时出错" }, { status: 500 });
  }
}
