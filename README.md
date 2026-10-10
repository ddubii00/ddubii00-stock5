# React + Vite

## Stock Fundamentals

Each stock chart includes PER, forward PER, ROE, forward ROE, PBR, PEG, market cap,
revenue, and operating income above the candles. Korean stocks use Naver Finance;
overseas stocks use Yahoo Finance. No additional API key is required.

The shared loader powers both `/api/fundamentals` on Vercel and the Express server
used locally or on Oracle. Data is cached for one hour, independently of live
price polling. Failed or partial provider requests are retried after five minutes.
Missing values are displayed as a dash, not zero. Hover a metric to see its fiscal
period or calculation basis. Available estimated metrics have an asterisk.
Amounts retain their reported currency; no currency conversion is performed.

## Rule-Based Trade Guidance

Below the candle legend and fundamentals, the app displays Stock5-8's partial
buy/sell rules, percentages, track, and contributing signals. The daily as-of date
and calculation notes are available by hovering the guidance strip.
The calculation always uses the latest 500 daily OHLCV rows, regardless of chart
timeframe or visible period, and needs at least 120 valid rows. It is reviewed
hourly; failed requests retry after one minute. Intraday daily bars are unfinished
and signals may change. Percentages are rule weights, not success probabilities
or automatic trading instructions. No order is sent to a broker.

The market header stays on one line. Narrow screens scroll only the header
horizontally. Vercel calls `/api`; Oracle subpath installations retain their
`/stock5-N/api` namespace.

## Three-Line Break

The header's `삼선` toggle switches all main price charts to Stock5-8's close-based
three-line break, off by default. Press it again to restore the original candles.
It works with each selected timeframe and the global weekly toggle; Ichimoku
continues to use the original OHLCV bars. Line timestamps are the source breakout
dates, not fabricated trading dates. Volume is accumulated once per source bar
until a line forms; unconfirmed volume waits for the next line.

Moving averages and Bollinger bands use synthetic line closes, with earlier lines
retained for indicator warm-up. MACD and its background are blank in this mode,
including in copied/analyzed images. Trend drawings are stored separately for
candles and line-break charts. Live updates change the original intraday bar and
recalculate the synthetic lines; unfinished bars can create or retract a line.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
