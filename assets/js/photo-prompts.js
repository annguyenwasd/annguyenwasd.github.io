(function () {
  'use strict';

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // Fallback for browsers that don't support the asynchronous Clipboard API.
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand('copy');
    input.remove();
    if (!copied) throw new Error('Copy command was not successful');
  }

  document.addEventListener('click', async function (event) {
    const button = event.target.closest('[data-copy-prompt]');
    if (!button) return;
    const target = document.getElementById(button.dataset.copyPrompt);
    if (!target) return;
    const defaultText = 'Sao chép';
    try {
      await copyText(target.textContent);
      button.textContent = 'Đã sao chép';
      button.dataset.copied = 'true';
    } catch (error) {
      button.textContent = 'Không thể sao chép';
      button.dataset.copied = 'false';
    }
    window.setTimeout(function () {
      button.textContent = defaultText;
      delete button.dataset.copied;
    }, 2200);
  });
})();
