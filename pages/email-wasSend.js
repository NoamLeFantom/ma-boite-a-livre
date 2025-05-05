import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ConfirmEmailPage() {

  return (
    <div style={{ padding: 20 }}>
      <h1>Un email de confirmation a été envoyé, consulte le pour te connecter.</h1>
      <hr/>
      <h2>Tu peux fermer cette page</h2>
    </div>
  );
}
