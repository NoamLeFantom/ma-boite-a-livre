import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <title>Book Traveller</title>
      <Component {...pageProps} />
    </>
  );
}
