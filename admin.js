/* ====================================
   ADMIN PANEL — JavaScript
   Supabase CRUD for Testimonials
   ==================================== */

let supabaseClient = null;
let isConfigured = false;

/* ---------- Initialize Supabase ---------- */
function initSupabase() {
  if (typeof SUPABASE_URL === 'undefined' ||
      typeof SUPABASE_ANON_KEY === 'undefined' ||
      SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' ||
      SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    isConfigured = false;
    document.getElementById('config-warning').style.display = 'flex';
    return false;
  }

  try {
    const { createClient } = supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    isConfigured = true;
    document.getElementById('config-warning').style.display = 'none';
    return true;
  } catch (err) {
    console.error('Supabase init failed:', err);
    isConfigured = false;
    document.getElementById('config-warning').style.display = 'flex';
    return false;
  }
}

/* ---------- Toast Notifications ---------- */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: 'ph-check-circle',
    error: 'ph-x-circle',
    info: 'ph-info'
  };

  toast.innerHTML = `<i class="ph-fill ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ---------- Login Gate ---------- */
(function () {
  const gate = document.getElementById('login-gate');
  const dashboard = document.getElementById('admin-dashboard');
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const pwInput = document.getElementById('admin-password');
  const togglePw = document.getElementById('toggle-pw');
  const logoutBtn = document.getElementById('btn-logout');

  // Check session
  if (sessionStorage.getItem('sukrutham_admin') === 'true') {
    gate.style.display = 'none';
    dashboard.style.display = 'block';
    initSupabase();
    loadTestimonials();
  }

  // Toggle password visibility
  if (togglePw) {
    togglePw.addEventListener('click', () => {
      const isPassword = pwInput.type === 'password';
      pwInput.type = isPassword ? 'text' : 'password';
      togglePw.querySelector('i').className = isPassword ? 'ph ph-eye-slash' : 'ph ph-eye';
    });
  }

  // Login form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = pwInput.value.trim();
    
    if (typeof ADMIN_PASSWORD === 'undefined') {
      errorEl.textContent = 'Admin password not configured in supabase-config.js';
      return;
    }

    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('sukrutham_admin', 'true');
      gate.style.display = 'none';
      dashboard.style.display = 'block';
      initSupabase();
      loadTestimonials();
    } else {
      errorEl.textContent = 'Incorrect password. Please try again.';
      pwInput.value = '';
      pwInput.focus();
    }
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('sukrutham_admin');
      gate.style.display = '';
      dashboard.style.display = 'none';
      pwInput.value = '';
      errorEl.textContent = '';
    });
  }
})();

/* ---------- CRUD Operations ---------- */
let allTestimonials = [];

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function renderStarsSmall(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<i class="ph-fill ph-star${i > rating ? ' dim' : ''}"></i>`;
  }
  return html;
}

async function loadTestimonials() {
  const list = document.getElementById('testimonials-list');
  const loading = document.getElementById('admin-loading');
  
  if (!isConfigured) {
    list.innerHTML = `
      <div class="admin-empty">
        <i class="ph ph-database"></i>
        <p>Configure Supabase to manage testimonials.</p>
      </div>
    `;
    updateStats([]);
    return;
  }

  if (loading) loading.style.display = '';

  try {
    const { data, error } = await supabaseClient
      .from('testimonials')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    allTestimonials = data || [];
    renderTestimonialsList(allTestimonials);
    updateStats(allTestimonials);
  } catch (err) {
    console.error('Load error:', err);
    showToast('Failed to load testimonials: ' + err.message, 'error');
    list.innerHTML = `
      <div class="admin-empty">
        <i class="ph ph-warning-circle"></i>
        <p>Failed to load testimonials. Check your Supabase configuration.</p>
      </div>
    `;
    updateStats([]);
  }
}

function renderTestimonialsList(testimonials) {
  const list = document.getElementById('testimonials-list');

  if (testimonials.length === 0) {
    list.innerHTML = `
      <div class="admin-empty">
        <i class="ph ph-chat-text"></i>
        <p>No testimonials yet. Add your first one above!</p>
      </div>
    `;
    return;
  }

  list.innerHTML = testimonials.map(t => `
    <div class="tl-item${t.is_featured ? ' featured' : ''}" data-id="${t.id}">
      <div class="tl-avatar">${getInitials(t.name)}</div>
      <div class="tl-content">
        <div class="tl-meta">
          <span class="tl-name">${escapeHtml(t.name)}</span>
          <span class="tl-location">${escapeHtml(t.location)}</span>
          ${t.is_featured ? '<span class="tl-badge">★ Featured</span>' : ''}
        </div>
        <div class="tl-stars">${renderStarsSmall(t.rating)}</div>
        <p class="tl-quote">"${escapeHtml(t.quote)}"</p>
      </div>
      <div class="tl-actions">
        <button class="tl-btn tl-btn-edit" onclick="openEditModal('${t.id}')" title="Edit">
          <i class="ph ph-pencil-simple"></i>
        </button>
        <button class="tl-btn tl-btn-delete" onclick="openDeleteModal('${t.id}', '${escapeHtml(t.name)}')" title="Delete">
          <i class="ph ph-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function updateStats(testimonials) {
  document.getElementById('stat-total').textContent = testimonials.length;
  document.getElementById('stat-featured').textContent = testimonials.filter(t => t.is_featured).length;
  
  if (testimonials.length > 0) {
    const avg = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;
    document.getElementById('stat-avg-rating').textContent = avg.toFixed(1);
  } else {
    document.getElementById('stat-avg-rating').textContent = '0';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- Add Testimonial ---------- */
(function () {
  const form = document.getElementById('add-form');
  const btn = document.getElementById('btn-add');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!isConfigured) {
      showToast('Supabase is not configured. Please update supabase-config.js', 'error');
      return;
    }

    const name = document.getElementById('add-name').value.trim();
    const location = document.getElementById('add-location').value.trim();
    const quote = document.getElementById('add-quote').value.trim();
    const rating = parseInt(document.getElementById('add-rating').value);
    const is_featured = document.getElementById('add-featured').checked;

    if (!name || !location || !quote) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-spinner"></i> Adding...';

    try {
      const { error } = await supabaseClient
        .from('testimonials')
        .insert([{ name, location, quote, rating, is_featured }]);

      if (error) throw error;

      showToast('Testimonial added successfully!', 'success');
      form.reset();
      document.getElementById('add-rating').value = '5';
      resetRatingPicker('add-rating-picker', 5);
      await loadTestimonials();
    } catch (err) {
      console.error('Add error:', err);
      showToast('Failed to add testimonial: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="ph ph-plus"></i> Add Testimonial';
    }
  });
})();

/* ---------- Edit Testimonial ---------- */
let editingId = null;

function openEditModal(id) {
  const t = allTestimonials.find(t => t.id === id);
  if (!t) return;

  editingId = id;
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-name').value = t.name;
  document.getElementById('edit-location').value = t.location;
  document.getElementById('edit-quote').value = t.quote;
  document.getElementById('edit-rating').value = t.rating;
  document.getElementById('edit-featured').checked = t.is_featured;
  resetRatingPicker('edit-rating-picker', t.rating);

  document.getElementById('edit-modal').style.display = '';
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
  editingId = null;
}

(function () {
  const form = document.getElementById('edit-form');
  const closeBtn = document.getElementById('modal-close');
  const cancelBtn = document.getElementById('btn-cancel-edit');
  const modal = document.getElementById('edit-modal');

  closeBtn.addEventListener('click', closeEditModal);
  cancelBtn.addEventListener('click', closeEditModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeEditModal();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!isConfigured || !editingId) return;

    const name = document.getElementById('edit-name').value.trim();
    const location = document.getElementById('edit-location').value.trim();
    const quote = document.getElementById('edit-quote').value.trim();
    const rating = parseInt(document.getElementById('edit-rating').value);
    const is_featured = document.getElementById('edit-featured').checked;

    if (!name || !location || !quote) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('testimonials')
        .update({ name, location, quote, rating, is_featured })
        .eq('id', editingId);

      if (error) throw error;

      showToast('Testimonial updated successfully!', 'success');
      closeEditModal();
      await loadTestimonials();
    } catch (err) {
      console.error('Update error:', err);
      showToast('Failed to update testimonial: ' + err.message, 'error');
    }
  });
})();

/* ---------- Delete Testimonial ---------- */
let deletingId = null;

function openDeleteModal(id, name) {
  deletingId = id;
  document.getElementById('delete-name').textContent = name;
  document.getElementById('delete-modal').style.display = '';
}

function closeDeleteModal() {
  document.getElementById('delete-modal').style.display = 'none';
  deletingId = null;
}

(function () {
  const closeBtn = document.getElementById('delete-modal-close');
  const cancelBtn = document.getElementById('btn-cancel-delete');
  const confirmBtn = document.getElementById('btn-confirm-delete');
  const modal = document.getElementById('delete-modal');

  closeBtn.addEventListener('click', closeDeleteModal);
  cancelBtn.addEventListener('click', closeDeleteModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeDeleteModal();
  });

  confirmBtn.addEventListener('click', async () => {
    if (!isConfigured || !deletingId) return;

    try {
      const { error } = await supabaseClient
        .from('testimonials')
        .delete()
        .eq('id', deletingId);

      if (error) throw error;

      showToast('Testimonial deleted successfully!', 'success');
      closeDeleteModal();
      await loadTestimonials();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete testimonial: ' + err.message, 'error');
    }
  });
})();

/* ---------- Rating Picker Interaction ---------- */
function setupRatingPicker(pickerId, inputId) {
  const picker = document.getElementById(pickerId);
  const input = document.getElementById(inputId);
  if (!picker || !input) return;

  const stars = picker.querySelectorAll('i');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.val);
      input.value = val;
      stars.forEach((s, i) => {
        s.classList.toggle('active', i < val);
      });
    });

    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.val);
      stars.forEach((s, i) => {
        s.classList.toggle('active', i < val);
      });
    });
  });

  picker.addEventListener('mouseleave', () => {
    const val = parseInt(input.value);
    stars.forEach((s, i) => {
      s.classList.toggle('active', i < val);
    });
  });
}

function resetRatingPicker(pickerId, value) {
  const picker = document.getElementById(pickerId);
  if (!picker) return;
  const stars = picker.querySelectorAll('i');
  stars.forEach((s, i) => {
    s.classList.toggle('active', i < value);
  });
}

setupRatingPicker('add-rating-picker', 'add-rating');
setupRatingPicker('edit-rating-picker', 'edit-rating');

/* ---------- Panel Toggle ---------- */
(function () {
  const toggle = document.getElementById('add-panel-toggle');
  const body = document.getElementById('add-panel-body');
  const icon = toggle ? toggle.querySelector('.panel-toggle-btn') : null;

  if (toggle && body) {
    toggle.addEventListener('click', () => {
      const isHidden = body.style.display === 'none';
      body.style.display = isHidden ? '' : 'none';
      if (icon) icon.classList.toggle('rotated', !isHidden);
    });
  }
})();

/* ---------- Refresh Button ---------- */
(function () {
  const btn = document.getElementById('btn-refresh');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.classList.add('spinning');
    await loadTestimonials();
    setTimeout(() => btn.classList.remove('spinning'), 600);
  });
})();
