import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { WebApp } from 'meteor/webapp';

// Only active in development mode
if (Meteor.isDevelopment) {
  const ROUTE_PREFIX = '/__meteor_mail__';
  const MAX_STORED_MAILS = 50;

  const storedMails = [];
  let mailId = 0;

  // ---- Capture outgoing mails via Email.hookSend ----

  Email.hookSend((mail) => {
    storedMails.unshift({
      id: ++mailId,
      timestamp: new Date().toISOString(),
      from: mail.from || '(no from)',
      to: mail.to || '(no to)',
      cc: mail.cc || null,
      bcc: mail.bcc || null,
      replyTo: mail.replyTo || null,
      subject: mail.subject || '(no subject)',
      text: mail.text || null,
      html: mail.html || null,
      headers: mail.headers || null,
    });
    if (storedMails.length > MAX_STORED_MAILS) {
      storedMails.length = MAX_STORED_MAILS;
    }
    return true; // continue normal sending
  });

  // ---- Helpers ----

  const esc = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const escSrcdoc = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;');
  };

  const addr = (v) => {
    if (!v) return '';
    return Array.isArray(v) ? v.join(', ') : String(v);
  };

  // ---- CSS ----

  const CSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f5f5f5; color: #333;
      padding: 24px; max-width: 960px; margin: 0 auto;
    }
    header { margin-bottom: 24px; }
    h1 { color: #de4f4f; font-size: 22px; margin-bottom: 4px; }
    .sub { color: #888; font-size: 13px; }
    a { color: #de4f4f; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #eee; padding: 2px 6px; border-radius: 3px; font-size: 13px; }

    .empty {
      background: white; padding: 32px; border-radius: 8px;
      text-align: center; color: #888; font-size: 14px;
    }
    table { width: 100%; background: white; border-radius: 8px; border-collapse: collapse; }
    thead { background: #fafafa; }
    th, td { padding: 10px 14px; text-align: left; font-size: 13px; border-bottom: 1px solid #eee; }
    th { font-weight: 600; color: #666; }
    tbody tr:hover { background: #fff5f5; cursor: pointer; }

    .back { font-size: 13px; display: inline-block; margin-bottom: 8px; }
    .fields {
      width: 100%; background: white; border-radius: 8px;
      border-collapse: collapse; margin-bottom: 16px;
    }
    .fields th {
      width: 100px; padding: 8px 14px; font-size: 12px;
      font-weight: 600; color: #888; text-align: right;
      border-bottom: 1px solid #f0f0f0;
    }
    .fields td { padding: 8px 14px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
    .tabs { margin-bottom: 0; display: flex; gap: 4px; }
    .tab {
      padding: 6px 16px; background: #e0e0e0; border: none;
      border-radius: 4px 4px 0 0; cursor: pointer;
      font-size: 12px; font-weight: 600; color: #666;
    }
    .tab.active { background: white; color: #de4f4f; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    iframe {
      width: 100%; min-height: 500px; border: 1px solid #ddd;
      border-radius: 0 8px 8px 8px; background: white;
    }
    .text-body {
      background: white; padding: 16px; border-radius: 0 8px 8px 8px;
      border: 1px solid #ddd; font-size: 13px;
      white-space: pre-wrap; word-break: break-word;
      max-height: 600px; overflow: auto;
    }
  `;

  // ---- Renderers ----

  const renderList = () => {
    const rows = storedMails.map(m => `
      <tr onclick="location='${ROUTE_PREFIX}/${m.id}'">
        <td>${m.id}</td>
        <td>${esc(addr(m.from))}</td>
        <td>${esc(addr(m.to))}</td>
        <td><strong>${esc(m.subject)}</strong></td>
        <td>${new Date(m.timestamp).toLocaleTimeString()}</td>
      </tr>`).join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Meteor Mail Preview</title>
<style>${CSS}
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.btn-clear { padding: 4px 12px; background: #e0e0e0; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; color: #666; }
.btn-clear:hover { background: #d0d0d0; }
.pulse { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #4caf50; margin-right: 6px; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
tr.new-row { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn { from { opacity: 0; background: #fff5f5; } to { opacity: 1; } }
</style></head><body>
<header>
  <h1>Meteor Mail Preview</h1>
  <div class="toolbar">
    <p class="sub"><span class="pulse"></span><span id="mail-count">${storedMails.length}</span> mail<span id="mail-plural">${storedMails.length !== 1 ? 's' : ''}</span> captured &mdash; dev mode only</p>
    <button class="btn-clear" onclick="clearMails()">Clear all</button>
  </div>
</header>
<div id="mail-list">
${storedMails.length === 0
  ? '<div class="empty">No mails captured yet.<br>Send an email with <code>Email.sendAsync()</code> and it will appear here.</div>'
  : `<table><thead><tr><th>#</th><th>From</th><th>To</th><th>Subject</th><th>Time</th></tr></thead><tbody id="mail-tbody">${rows}</tbody></table>`
}
</div>
<script>
let knownIds = new Set(${JSON.stringify(storedMails.map(m => m.id))});
const esc = s => s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '';
const addr = v => !v ? '' : Array.isArray(v) ? v.join(', ') : String(v);

function poll() {
  fetch('${ROUTE_PREFIX}/api/mails').then(r => r.json()).then(data => {
    const mails = data.mails;
    document.getElementById('mail-count').textContent = mails.length;
    document.getElementById('mail-plural').textContent = mails.length !== 1 ? 's' : '';

    if (mails.length === 0) {
      document.getElementById('mail-list').innerHTML =
        '<div class="empty">No mails captured yet.<br>Send an email with <code>Email.sendAsync()</code> and it will appear here.</div>';
      knownIds.clear();
      return;
    }

    let tbody = document.getElementById('mail-tbody');
    if (!tbody) {
      document.getElementById('mail-list').innerHTML =
        '<table><thead><tr><th>#</th><th>From</th><th>To</th><th>Subject</th><th>Time</th></tr></thead><tbody id="mail-tbody"></tbody></table>';
      tbody = document.getElementById('mail-tbody');
    }

    const newIds = new Set(mails.map(m => m.id));
    // rebuild rows
    tbody.innerHTML = mails.map(m => {
      const isNew = !knownIds.has(m.id);
      return '<tr' + (isNew ? ' class="new-row"' : '') + ' onclick="location=\\'${ROUTE_PREFIX}/' + m.id + '\\'">' +
        '<td>' + m.id + '</td>' +
        '<td>' + esc(addr(m.from)) + '</td>' +
        '<td>' + esc(addr(m.to)) + '</td>' +
        '<td><strong>' + esc(m.subject) + '</strong></td>' +
        '<td>' + new Date(m.timestamp).toLocaleTimeString() + '</td></tr>';
    }).join('');
    knownIds = newIds;
  }).catch(() => {});
}

function clearMails() {
  fetch('${ROUTE_PREFIX}/api/mails', { method: 'DELETE' }).then(() => poll());
}

setInterval(poll, 2000);
</script>
</body></html>`;
  };

  const renderDetail = (mail) => {
    if (!mail) {
      return `<!DOCTYPE html><html><head><title>Not Found</title>
<style>${CSS}</style></head><body>
<header><h1>Mail not found</h1></header>
<p><a href="${ROUTE_PREFIX}">&larr; Back</a></p>
</body></html>`;
    }

    const fields = [
      ['From', addr(mail.from)],
      ['To', addr(mail.to)],
      mail.cc && ['Cc', addr(mail.cc)],
      mail.bcc && ['Bcc', addr(mail.bcc)],
      mail.replyTo && ['Reply-To', addr(mail.replyTo)],
      ['Subject', mail.subject],
      ['Time', new Date(mail.timestamp).toLocaleString()],
    ].filter(Boolean);

    const fieldRows = fields.map(([k, v]) =>
      `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`
    ).join('');

    const hasHtml = !!mail.html;
    const hasText = !!mail.text;

    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${esc(mail.subject)} - Mail Preview</title>
<style>${CSS}</style></head><body>
<header>
  <a href="${ROUTE_PREFIX}" class="back">&larr; All mails</a>
  <h1>${esc(mail.subject)}</h1>
</header>
<table class="fields">${fieldRows}</table>
<div class="tabs">
  ${hasHtml ? '<button class="tab active" onclick="showTab(\'html\',this)">HTML</button>' : ''}
  ${hasText ? `<button class="tab${!hasHtml ? ' active' : ''}" onclick="showTab('text',this)">Plain Text</button>` : ''}
  ${hasHtml ? '<button class="tab" onclick="showTab(\'source\',this)">HTML Source</button>' : ''}
</div>
${hasHtml ? `<div id="tab-html" class="tab-content active">
  <iframe sandbox="allow-same-origin allow-popups allow-top-navigation" srcdoc="${escSrcdoc(mail.html)}"></iframe>
</div>` : ''}
${hasText ? `<div id="tab-text" class="tab-content${!hasHtml ? ' active' : ''}">
  <pre class="text-body">${esc(mail.text)}</pre>
</div>` : ''}
${hasHtml ? `<div id="tab-source" class="tab-content">
  <pre class="text-body">${esc(mail.html)}</pre>
</div>` : ''}
<script>
function showTab(name, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + name)?.classList.add('active');
  btn.classList.add('active');
}
</script>
</body></html>`;
  };

  // ---- Routes ----
  // Use rawConnectHandlers to register before Rspack/client catch-all

  WebApp.rawConnectHandlers.use(ROUTE_PREFIX, (req, res, next) => {
    const path = req.url.replace(/\?.*$/, '');

    // JSON API — list / clear
    if (path === '/api/mails') {
      if (req.method === 'DELETE') {
        storedMails.length = 0;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mails: storedMails }));
      return;
    }

    // JSON API — single mail
    const apiMatch = path.match(/^\/api\/mails\/(\d+)$/);
    if (apiMatch) {
      const mail = storedMails.find(m => m.id === parseInt(apiMatch[1], 10));
      res.writeHead(mail ? 200 : 404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mail ? { mail } : { error: 'Not found' }));
      return;
    }

    // HTML — detail
    const detailMatch = path.match(/^\/(\d+)$/);
    if (detailMatch) {
      const mail = storedMails.find(m => m.id === parseInt(detailMatch[1], 10));
      res.writeHead(mail ? 200 : 404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderDetail(mail));
      return;
    }

    // HTML — list
    if (path === '/' || path === '') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderList());
      return;
    }

    next();
  });

  console.log(`=> Mail preview at ${Meteor.absoluteUrl()}${ROUTE_PREFIX.slice(1)}`);
}
