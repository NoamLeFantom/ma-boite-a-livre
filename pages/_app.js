import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <title>Books Travellers</title>
      <Component {...pageProps} />
    </>
  );
}
