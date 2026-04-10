/* VTop Portal — Shared JS */

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function go(page) {
    window.location.href = page;
}

// AJAX helpers
async function fetchAPI(endpoint) {
    try {
        const res = await fetch(`/api/${endpoint}`);
        const json = await res.json();
        return json.success ? json.data : null;
    } catch (err) {
        console.error(`API error (${endpoint}):`, err);
        return null;
    }
}

async function postAPI(endpoint, body) {
    try {
        const res = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return await res.json();
    } catch (err) {
        return { success: false, error: 'Network error.' };
    }
}

// Close sidebar on outside click (mobile)
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.querySelector('.menu-btn');
    if (sidebar && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});
