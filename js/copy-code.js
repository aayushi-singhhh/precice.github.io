/**
 * copy-code.js
 * Adds a "Copy" button to every highlighted code block (<div class="highlight"><pre>).
 * Uses the async Clipboard API with a textarea fallback for older browsers.
 * No dependencies — pure vanilla JS.
 */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────── */
  var LABELS = { idle: 'Copy', success: 'Copied!', error: 'Failed' };
  var RESET_DELAY = 2000; // ms before button text resets

  /* ── Helpers ─────────────────────────────────────── */

  /** Extract clean text from a <pre> element, stripping any leading prompt chars. */
  function getCode(pre) {
    return pre.innerText || pre.textContent || '';
  }

  /** Copy text using the modern Clipboard API, falling back to execCommand. */
  function copyText(text, onSuccess, onError) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onSuccess, onError);
    } else {
      // execCommand fallback (works on http:// and older browsers)
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        onSuccess();
      } catch (e) {
        onError(e);
      }
    }
  }

  /** Build and return the copy button element. */
  function makeButton() {
    var btn = document.createElement('button');
    btn.className = 'copy-code-btn';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.setAttribute('title', 'Copy code to clipboard');
    btn.textContent = LABELS.idle;
    return btn;
  }

  /** Reset button back to idle state after a delay. */
  function resetButton(btn) {
    setTimeout(function () {
      btn.textContent = LABELS.idle;
      btn.classList.remove('copy-code-btn--success', 'copy-code-btn--error');
      btn.disabled = false;
    }, RESET_DELAY);
  }

  /* ── Main: attach buttons ─────────────────────────── */

  function attachCopyButtons() {
    /*
     * Target every Rouge-highlighted block: <div class="highlight"><pre>...</pre></div>
     * Also catch bare <pre><code> blocks that Rouge didn't wrap.
     */
    var blocks = document.querySelectorAll(
      'div.highlight pre, pre > code:only-child'
    );

    blocks.forEach(function (el) {
      /* Resolve the <pre> element regardless of whether we matched pre or code */
      var pre = el.tagName === 'PRE' ? el : el.parentElement;

      /* Avoid adding a second button if already processed */
      if (pre.parentElement.querySelector('.copy-code-btn')) return;

      /* Wrap pre in a relative-positioned container if not already inside .highlight */
      var wrapper = pre.parentElement;
      if (!wrapper.classList.contains('highlight')) {
        var div = document.createElement('div');
        div.className = 'highlight highlight--bare';
        pre.parentNode.insertBefore(div, pre);
        div.appendChild(pre);
        wrapper = div;
      }

      /* Make wrapper the positioning context */
      wrapper.style.position = 'relative';

      var btn = makeButton();

      btn.addEventListener('click', function () {
        btn.disabled = true;
        var code = getCode(pre);

        copyText(
          code,
          function () {
            btn.textContent = LABELS.success;
            btn.classList.add('copy-code-btn--success');
            resetButton(btn);
          },
          function () {
            btn.textContent = LABELS.error;
            btn.classList.add('copy-code-btn--error');
            resetButton(btn);
          }
        );
      });

      wrapper.appendChild(btn);
    });
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachCopyButtons);
  } else {
    attachCopyButtons();
  }
})();
