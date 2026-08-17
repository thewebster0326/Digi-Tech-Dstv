document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = 'Sending...';
    status.className = '';

    var formData = new FormData(form);
    var payload = {};
    formData.forEach(function (value, key) { payload[key] = value; });

    fetch('/contact-handler.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.success) {
          status.textContent = "Thanks! We've received your message and will be in touch shortly.";
          status.className = 'status-success';
          form.reset();
        } else {
          status.textContent = data.error || 'Something went wrong. Please try again or call us directly.';
          status.className = 'status-error';
        }
      })
      .catch(function () {
        status.textContent = 'Something went wrong. Please try again or call us directly.';
        status.className = 'status-error';
      });
  });
});
