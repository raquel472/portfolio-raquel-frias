// Publica conteúdo do editor no GitHub (um commit por chamada).
// Requer: Netlify Identity (usuário logado) + variáveis GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH.
const API = 'https://api.github.com';
const ALLOWED = /^(data\/(projects|profile|testimonials|media)\.json|assets\/uploads\/[a-z0-9-]+\.(jpg|jpeg|png|webp))$/;
const H = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const out = (statusCode, obj) => ({ statusCode, headers: H, body: JSON.stringify(obj) });

exports.handler = async (event, context) => {
  const { GITHUB_TOKEN: token, GITHUB_REPO: repo, GITHUB_BRANCH: branch = 'main' } = process.env;
  if (event.httpMethod === 'GET') return out(200, { ok: true, configured: !!(token && repo) });
  if (event.httpMethod !== 'POST') return out(405, { error: 'Método não permitido.' });

  const user = context.clientContext && context.clientContext.user;
  if (!user) return out(401, { error: 'Sessão expirada. Entre novamente para publicar.' });
  if (!token || !repo) return out(500, { error: 'Publicação não configurada: faltam variáveis GITHUB_TOKEN / GITHUB_REPO na Netlify.' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return out(400, { error: 'Dados inválidos.' }); }
  const files = Array.isArray(body.files) ? body.files : [];
  if (!files.length || files.length > 40) return out(400, { error: 'Nenhum arquivo para publicar.' });
  for (const f of files) {
    if (!f || !ALLOWED.test(f.path || '')) return out(400, { error: 'Arquivo não permitido: ' + (f && f.path) });
    if (f.path.endsWith('.json')) { try { JSON.parse(f.content); } catch (e) { return out(400, { error: 'JSON inválido em ' + f.path }); } }
  }

  const gh = async (path, opts = {}) => {
    const r = await fetch(API + '/repos/' + repo + path, {
      ...opts,
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json', 'User-Agent': 'rf-portfolio-editor' }
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error('GitHub: ' + (j.message || r.status));
    return j;
  };

  try {
    const ref = await gh('/git/ref/heads/' + branch);
    const parent = ref.object.sha;
    const commit = await gh('/git/commits/' + parent);
    const tree = [];
    for (const f of files) {
      const blob = await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: f.content, encoding: f.encoding === 'base64' ? 'base64' : 'utf-8' }) });
      tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const nt = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: commit.tree.sha, tree }) });
    const message = String(body.message || 'Atualização de conteúdo').slice(0, 120) + ' — por ' + (user.email || 'editor') + (body.skipDeploy ? ' [skip netlify]' : '');
    const nc = await gh('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: nt.sha, parents: [parent] }) });
    await gh('/git/refs/heads/' + branch, { method: 'PATCH', body: JSON.stringify({ sha: nc.sha }) });
    return out(200, { ok: true, commit: nc.sha });
  } catch (e) {
    return out(502, { error: e.message });
  }
};
