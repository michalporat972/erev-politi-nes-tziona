/* Registration form — submits to Netlify Forms over fetch so the page can show
 * the confirmation card in place, the way the design does.
 *
 * Progressive enhancement: the markup is a plain <form method="POST"> that
 * Netlify's build bot registers at deploy time. With JS off the browser posts
 * it natively and Netlify redirects to success.html. With JS on we take the
 * submit over, so `required` is handed off to our own Hebrew error message
 * instead of the browser's validation bubble.
 */
(() => {
  const form = document.getElementById('registration-form');
  const confirmCard = document.getElementById('confirm');
  const confirmName = document.getElementById('confirm-name');
  const error = document.getElementById('form-error');
  if (!form || !confirmCard) return;

  form.noValidate = true;

  const fail = (msg) => {
    error.textContent = msg;
    error.hidden = false;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.hidden = true;

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();

    if (!name) {
      fail('רק שם — כדי שנדע למי לשמור מקום.');
      form.querySelector('#f-name').focus();
      return;
    }

    // Payment gates the registration. A static page can't verify a PayBox
    // transfer, so this is the registrant's own word — recorded as `paid` so
    // it can be reconciled against the PayBox group.
    if (!data.get('paid')) {
      fail('קודם התשלום בפייבוקס — בלי זה המקום לא נשמר. אחרי שמשלמים, מסמנים את התיבה.');
      const pay = document.getElementById('pay');
      pay.classList.remove('pay-flash');
      void pay.offsetWidth;          // restart the animation on a repeat submit
      pay.classList.add('pay-flash');
      pay.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.querySelector('#f-paid').focus({ preventScroll: true });
      return;
    }

    const submit = form.querySelector('.submit');
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      confirmName.textContent = name;
      form.hidden = true;
      confirmCard.hidden = false;
      confirmCard.setAttribute('tabindex', '-1');
      confirmCard.focus();
      confirmCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
      fail('משהו השתבש בשליחה. נסו שוב, או שלחו לנו הודעה ונרשום אתכם ידנית.');
    }
  });
})();
