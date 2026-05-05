/* ─────────────────────────────────────────────────────────────
   APP.JS — lógica principal
───────────────────────────────────────────────────────────── */

// ── Estado ────────────────────────────────────────────────────
const state = {
  activeCategory: null,   // null = todos
  activeSubcat: null,
  search: '',
  sortKey: null,
  sortDir: 1,
  page: 1,
  perPage: 8,
};

// ── Helpers ───────────────────────────────────────────────────
function totalUnits(m) {
  if (m.tallas) return m.tallas.reduce((a, t) => a + t.cantidad, 0);
  return m.cantidad ?? 0;
}

function mainShelf(m) {
  if (m.tallas) {
    const shelves = [...new Set(m.tallas.map(t => t.estanteria).filter(Boolean))];
    return shelves.join(', ');
  }
  return m.estanteria ?? '—';
}

function mainNote(m) {
  if (m.tallas) {
    const notes = m.tallas.map(t => t.notas).filter(Boolean);
    return notes[0] ?? '—';
  }
  return m.notas_item ?? '—';
}

function uniqueShelves() {
  const s = new Set();
  MATERIALES.forEach(m => {
    if (m.tallas) m.tallas.forEach(t => { if (t.estanteria) s.add(t.estanteria); });
    else if (m.estanteria) s.add(m.estanteria);
  });
  return s.size;
}

function highlight(text, q) {
  if (!q) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

// ── Filtrado / datos visibles ─────────────────────────────────
function filteredData() {
  let data = [...MATERIALES];
  if (state.activeCategory) data = data.filter(m => m.categoria === state.activeCategory);
  if (state.activeSubcat)   data = data.filter(m => m.subcategoria === state.activeSubcat);
  if (state.search) {
    const q = state.search.toLowerCase();
    data = data.filter(m =>
      m.nombre.toLowerCase().includes(q) ||
      (m.codigo && m.codigo.includes(q)) ||
      (m.descripcion && m.descripcion.toLowerCase().includes(q))
    );
  }
  if (state.sortKey) {
    data.sort((a, b) => {
      let va, vb;
      if (state.sortKey === 'nombre')   { va = a.nombre;      vb = b.nombre; }
      if (state.sortKey === 'cantidad') { va = totalUnits(a); vb = totalUnits(b); }
      if (typeof va === 'string') return va.localeCompare(vb) * state.sortDir;
      return (va - vb) * state.sortDir;
    });
  }
  return data;
}

// ── Stats ─────────────────────────────────────────────────────
function renderStats(data) {
  document.getElementById('statMaterials').textContent = data.length;
  document.getElementById('statUnits').textContent = data.reduce((a, m) => a + totalUnits(m), 0);
}

// ── Sidebar ───────────────────────────────────────────────────
function renderSidebar() {
  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = '';

  // "Todos"
  const allItem = document.createElement('div');
  allItem.className = 'nav-item' + (!state.activeCategory ? ' active' : '');
  allItem.innerHTML = `<span class="icon">📋</span> Todos los materiales`;
  allItem.addEventListener('click', () => {
    state.activeCategory = null;
    state.activeSubcat = null;
    state.page = 1;
    showHome();
    renderSidebar();
    renderTable();
    updatePageHeading();
    closeSidebar();
  });
  nav.appendChild(allItem);

  CATEGORIAS.forEach(cat => {
    const hasSubs = cat.subcategorias && cat.subcategorias.length;
    const isOpen  = state.activeCategory === cat.id;

    const item = document.createElement('div');
    item.className = 'nav-item' + (isOpen ? ' active' : '') + (hasSubs && isOpen ? ' open' : '');
    item.innerHTML = `
      <span class="icon">${cat.icono}</span>
      ${cat.nombre}
      ${hasSubs ? `<span class="chevron">▶</span>` : ''}
    `;
    item.addEventListener('click', () => {
      state.activeCategory = cat.id;
      state.activeSubcat = null;
      state.page = 1;
      showHome();
      renderSidebar();
      renderTable();
      updatePageHeading();
      closeSidebar();
    });
    nav.appendChild(item);

    if (hasSubs) {
      const sub = document.createElement('div');
      sub.className = 'nav-sub' + (isOpen ? ' open' : '');
      cat.subcategorias.forEach(sc => {
        const si = document.createElement('div');
        si.className = 'nav-sub-item' + (state.activeSubcat === sc ? ' active' : '');
        si.textContent = sc;
        si.addEventListener('click', e => {
          e.stopPropagation();
          state.activeCategory = cat.id;
          state.activeSubcat = sc;
          state.page = 1;
          showHome();
          renderSidebar();
          renderTable();
          updatePageHeading();
          closeSidebar();
        });
        sub.appendChild(si);
      });
      nav.appendChild(sub);
    }
  });
}

// ── Page heading ──────────────────────────────────────────────
function updatePageHeading() {
  const title = document.getElementById('pageTitle');
  const sub   = document.getElementById('pageSubtitle');
  if (!state.activeCategory) {
    title.textContent = 'Todos los materiales';
    sub.textContent   = 'Inventario general del almacén del instituto';
  } else {
    const cat = CATEGORIAS.find(c => c.id === state.activeCategory);
    title.textContent = state.activeSubcat ? state.activeSubcat : cat.nombre;
    sub.textContent   = state.activeSubcat
      ? `${cat.nombre} › ${state.activeSubcat}`
      : `Materiales de la categoría ${cat.nombre}`;
  }
}

// ── Table ─────────────────────────────────────────────────────
function renderTable() {
  const data   = filteredData();
  const tbody  = document.getElementById('inventoryBody');
  const total  = data.length;
  const start  = (state.page - 1) * state.perPage;
  const paged  = data.slice(start, start + state.perPage);
  const q      = state.search;

  renderStats(data);

  if (!paged.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">No se encontraron materiales</td></tr>`;
  } else {
    tbody.innerHTML = paged.map(m => {
      const cat  = CATEGORIAS.find(c => c.id === m.categoria);
      const qty  = totalUnits(m);
      const shelf= mainShelf(m);
      const note = mainNote(m);
      const name = highlight(m.nombre, q);

      // Talla: si tiene tallas, mostrar el badge de la primera; si no, —
      const talaCell = m.tallas
        ? `<span class="size-badge">${m.tallas[0].talla}</span>`
        : `<span style="color:var(--text-light)">—</span>`;

      return `<tr data-id="${m.id}">
        <td class="td-material">${name}<small>${m.codigo || ''}</small></td>
        <td><span class="cat-tag ${m.categoria}">${cat ? cat.nombre : m.categoria}</span></td>
        <td class="td-qty">${qty}</td>
        <td>${talaCell}</td>
        <td class="td-loc">${highlight(shelf, q)}</td>
        <td class="td-note">${highlight(note, q)}</td>
      </tr>`;
    }).join('');

    // Click en fila
    tbody.querySelectorAll('tr[data-id]').forEach(tr => {
      tr.addEventListener('click', () => showDetail(tr.dataset.id));
    });
  }

  renderPagination(total);
}

// ── Pagination ────────────────────────────────────────────────
function renderPagination(total) {
  const pages = Math.ceil(total / state.perPage);
  const pg    = document.getElementById('pagination');
  if (pages <= 1) { pg.innerHTML = ''; return; }

  let html = `<button class="page-btn" ${state.page===1?'disabled':''} id="pgPrev">◀ Anterior</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="page-btn ${i===state.page?'active':''}" data-p="${i}">${i}</button>`;
  }
  html += `<button class="page-btn" ${state.page===pages?'disabled':''} id="pgNext">Siguiente ▶</button>`;
  pg.innerHTML = html;

  pg.querySelector('#pgPrev')?.addEventListener('click', () => { state.page--; renderTable(); });
  pg.querySelector('#pgNext')?.addEventListener('click', () => { state.page++; renderTable(); });
  pg.querySelectorAll('[data-p]').forEach(btn => {
    btn.addEventListener('click', () => { state.page = +btn.dataset.p; renderTable(); });
  });
}

// ── Detail page ───────────────────────────────────────────────
function showDetail(id) {
  const m    = MATERIALES.find(x => x.id === id);
  if (!m) return;

  const card = document.getElementById('detailCard');
  const cat  = CATEGORIAS.find(c => c.id === m.categoria);
  const isRopa = !!m.tallas;

  // Bloque de inventario
  let invHtml = '';
  if (isRopa) {
    invHtml = `
      <div class="inv-table-label">Inventario por talla</div>
      <div class="inv-table-wrap">
        <table>
          <thead><tr>
            <th>Talla</th><th>Cantidad</th><th>Estantería</th><th>Notas</th>
          </tr></thead>
          <tbody>
            ${m.tallas.map(t => `<tr>
              <td><span class="size-badge">${t.talla}</span></td>
              <td class="td-qty">${t.cantidad}</td>
              <td class="td-loc">${t.estanteria || '—'}</td>
              <td class="td-note">${t.notas || '—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } else {
    invHtml = `
      <div class="inv-table-label">Inventario</div>
      <div class="no-sizes-info">
        <div class="info-block">
          <div class="lbl">Unidades</div>
          <div class="val">${m.cantidad}</div>
        </div>
        <div class="info-block">
          <div class="lbl">Estantería</div>
          <div class="val sm">${m.estanteria || '—'}</div>
        </div>
        ${m.notas_item ? `<div class="info-block" style="grid-column:1/-1">
          <div class="lbl">Notas</div>
          <div class="val sm">${m.notas_item}</div>
        </div>` : ''}
      </div>`;
  }

  // Colores relacionados
  let relHtml = '';
  if (m.colores_relacionados && m.colores_relacionados.length) {
    const items = m.colores_relacionados.map(rid => {
      const r = MATERIALES.find(x => x.id === rid);
      if (!r) return '';
      return `<div class="related-item" data-id="${r.id}">
        <img src="${r.imagen}" alt="${r.nombre}" onerror="this.style.display='none'"/>
        <span>${r.nombre}</span>
        <span class="arrow">→</span>
      </div>`;
    }).join('');
    relHtml = `<div class="related-section">
      <div class="inv-table-label">También disponible en otros colores</div>
      <div class="related-list">${items}</div>
    </div>`;
  }

  card.innerHTML = `
    <div class="detail-img-wrap">
      <img src="${m.imagen}" alt="${m.nombre}"
           onerror="this.src='https://via.placeholder.com/300x300?text=Sin+imagen'" />
    </div>
    <div class="detail-info">
      <h2>${m.nombre}</h2>
      <div class="detail-code">${m.codigo || ''}</div>
      ${m.descripcion ? `<p class="detail-desc">${m.descripcion}</p>` : ''}
      ${invHtml}
      ${relHtml}
    </div>
  `;

  // Click en colores relacionados
  card.querySelectorAll('.related-item[data-id]').forEach(el => {
    el.addEventListener('click', () => showDetail(el.dataset.id));
  });

  document.getElementById('homePage').classList.add('hidden');
  document.getElementById('detailPage').classList.add('visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showHome() {
  document.getElementById('homePage').classList.remove('hidden');
  document.getElementById('detailPage').classList.remove('visible');
}

// ── Back button ───────────────────────────────────────────────
document.getElementById('btnBack').addEventListener('click', () => {
  showHome();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Search ────────────────────────────────────────────────────
let searchTimer;
document.getElementById('searchInput').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = e.target.value.trim();
    state.page = 1;
    state.activeCategory = null;
    state.activeSubcat = null;
    renderSidebar();
    updatePageHeading();
    renderTable();
  }, 200);
});

// ── Sort ──────────────────────────────────────────────────────
const SORT_CYCLE = [
  { key: 'nombre',   dir:  1, label: 'Nombre A–Z' },
  { key: 'nombre',   dir: -1, label: 'Nombre Z–A' },
  { key: 'cantidad', dir: -1, label: 'Mayor cantidad' },
  { key: 'cantidad', dir:  1, label: 'Menor cantidad' },
  { key: null,       dir:  1, label: 'Sin orden' },
];
let sortIdx = 4;
document.getElementById('btnSort').addEventListener('click', () => {
  sortIdx = (sortIdx + 1) % SORT_CYCLE.length;
  const s = SORT_CYCLE[sortIdx];
  state.sortKey = s.key;
  state.sortDir = s.dir;
  document.getElementById('btnSort').textContent = s.label + ' ▾';
  renderTable();
});

// ── Export Excel ────────────────────────────────────────────────
document.getElementById('btnExport').addEventListener('click', () => {
  const data = filteredData();
  const rows = [['Material','Código','Categoría','Talla','Cantidad','Estantería','Notas']];
  data.forEach(m => {
    if (m.tallas) {
      m.tallas.forEach(t => {
        const cat = CATEGORIAS.find(c => c.id === m.categoria);
        rows.push([m.nombre, m.codigo||'', cat?.nombre||m.categoria, t.talla, t.cantidad, t.estanteria||'', t.notas||'']);
      });
    } else {
      const cat = CATEGORIAS.find(c => c.id === m.categoria);
      rows.push([m.nombre, m.codigo||'', cat?.nombre||m.categoria, '—', m.cantidad, m.estanteria||'', m.notas_item||'']);
    }
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
  XLSX.writeFile(wb, 'inventario_lacimurga.xlsx');
});

// ── Hamburger (mobile) ────────────────────────────────────────
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
});
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}
document.getElementById('overlay').addEventListener('click', closeSidebar);

// ── Navegación con botón atrás del navegador ──────────────────
window.addEventListener('popstate', () => {
  if (document.getElementById('detailPage').classList.contains('visible')) {
    showHome();
  }
});

// Modificar showDetail para guardar estado en el historial
const originalShowDetail = showDetail;
showDetail = function(id) {
  history.pushState({ page: 'detail', id: id }, '', '#detalle-' + id);
  originalShowDetail(id);
};

// Modificar showHome para limpiar el hash
const originalShowHome = showHome;
showHome = function() {
  if (location.hash.startsWith('#detalle-')) {
    history.back();
  } else {
    originalShowHome();
  }
};

// ── Init ──────────────────────────────────────────────────────
renderSidebar();
updatePageHeading();
renderTable();