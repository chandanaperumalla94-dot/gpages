const { spawn } = require('child_process');
const os = require('os');

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const profileDir = os.tmpdir() + '\\chrome-test-' + Date.now();
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,900',
    '--user-data-dir=' + profileDir,
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version').then(r => r.json());
      wsUrl = res.webSocketDebuggerUrl;
      break;
    } catch (e) {}
  }

  const WebSocket = globalThis.WebSocket;
  const ws = new WebSocket(wsUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((res, rej) => {
    const msgId = id++;
    const handler = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === msgId) {
        ws.removeEventListener('message', handler);
        d.error ? rej(d.error) : res(d.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  await new Promise(r => ws.onopen = r);

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const pageTarget = await fetch('http://127.0.0.1:9222/json').then(r => r.json()).then(t => t.find(x => x.id === targetId));
  const pageWs = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => pageWs.onopen = r);

  let pageId = 1;
  const sendPage = (method, params = {}) => new Promise((res, rej) => {
    const msgId = pageId++;
    const handler = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === msgId) {
        pageWs.removeEventListener('message', handler);
        d.error ? rej(d.error) : res(d.result);
      }
    };
    pageWs.addEventListener('message', handler);
    pageWs.send(JSON.stringify({ id: msgId, method, params }));
  });

  await sendPage('Page.enable');
  await sendPage('Runtime.enable');

  await sendPage('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 3500));

  const debugBtn = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const b = document.querySelector('#hero-explore-btn');
      if (!b) return 'BTN_NOT_FOUND';
      const s = window.getComputedStyle(b);
      const r = b.getBoundingClientRect();
      return {
        outerHTML: b.outerHTML,
        rect: { x: r.x, y: r.y, width: r.width, height: r.height },
        display: s.display,
        visibility: s.visibility,
        opacity: s.opacity,
        background: s.backgroundColor,
        color: s.color,
        disabled: b.disabled
      };
    })()`,
    returnByValue: true
  });
  console.log('DEBUG BTN:', JSON.stringify(debugBtn.result.value, null, 2));

  pageWs.close();
  ws.close();
  chrome.kill();
}

run().catch(e => { console.error(e); process.exit(1); });
