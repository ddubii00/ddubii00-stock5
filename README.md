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
buy/sell rules, percentages, track, contributing signals, and daily as-of date.
The calculation always uses the latest 500 daily OHLCV rows, regardless of chart
timeframe or visible period, and needs at least 120 valid rows. It is reviewed
hourly; failed requests retry after one minute. Intraday daily bars are unfinished
and signals may change. Percentages are rule weights, not success probabilities
or automatic trading instructions. No order is sent to a broker.

The market header stays on one line. Narrow screens scroll only the header
horizontally. Vercel calls `/api`; Oracle subpath installations retain their
`/stock5-N/api` namespace.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
