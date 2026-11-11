const form = document.querySelector('#certificate-form');
const status = document.querySelector('#status');
const submit = document.querySelector('#submit');
const download = document.querySelector('#download');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  download.classList.add('hidden');
  status.textContent = 'Checking your eligibility…';
  status.className = 'status';
  submit.disabled = true;
  try {
    const response = await fetch('/api/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name.value, enrollment_no: form.enrollment_no.value })
    });
    const result = await response.json();
    if (result.eligible && result.token) {
      status.textContent = 'Your certificate is ready.';
      status.className = 'status success';
      download.href = `/api/certificate?token=${encodeURIComponent(result.token)}`;
      download.classList.remove('hidden');
    } else {
      const isLegacyRateLimit = /too many attempts/i.test(result.error || '');
      status.textContent = isLegacyRateLimit ? '' : (result.error || 'No eligible record found. Please check your name and enrollment number.');
      status.className = isLegacyRateLimit ? 'status' : 'status error';
    }
  } catch (_) {
    status.textContent = 'Unable to check eligibility right now. Please try again.';
    status.className = 'status error';
  } finally { submit.disabled = false; }
});
