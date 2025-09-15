export function captureMessage(message: string) {
  console.log(message);
  fetch("/message", {
    method: "POST",
    body: JSON.stringify({
      message,
    }),
  });
}
