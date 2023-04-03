

/** @param {MessageEvent<any>} e */
function onWindowMessage(e) {
  if (e.source === window && e?.data?.type === "send-firefox-messaging-port") {
    window.removeEventListener("message", onWindowMessage);
    const port = e.ports?.[0];
    port.postMessage({ type: "pong" });
    port.addEventListener("message", async e => {
      if (e.data.type === "fetch-set") {
        const set = await browser.runtime.sendMessage(e.data);
        port.postMessage({ type: "set-fetched", set })
      }
    });
    port.start();
  }
}

window.addEventListener("message", onWindowMessage);