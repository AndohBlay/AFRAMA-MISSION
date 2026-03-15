// Form validation and secure submit for Aframa Mission School contact form
(() => {
	'use strict';

	// Configuration
	const formSelector = '#contactForm'; // if ID changes, update HTML
	const submitUrl = '/submit-contact'; // server endpoint (same as form action)
	const RATE_LIMIT_MS = 3000; // minimum ms between submissions

	// Simple helpers
	const $ = (s, ctx = document) => ctx.querySelector(s);
	const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

	// Minimal sanitizer for text inserted into the DOM as textContent
	function sanitizeText(value) {
		if (typeof value !== 'string') return '';
		return value.replace(/\u0000/g, '').trim();
	}

	// Escape for inserting into HTML (if you ever need innerHTML) - prefer textContent
	function escapeHtml(str) {
		return str.replace(/[&<>"']/g, (c) => ({
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;'
		}[c]));
	}

	// Basic validators
	const validators = {
		name: (v) => v.length >= 2 && v.length <= 100,
		email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
		level: (v

		) => v.length >= 1 && v.length <= 50,
		message: (v) => v.length >= 10 && v.length <= 1000,
	};

	// Friendly validation messages
	const messages = {
		name: 'Please enter your full name (2-30 characters).',
		email: 'Please enter a valid email address.',
		level: 'Please enter your class level.',
		message: 'Please write a message (at least 10 characters).',
	};

	// Last submit timestamp for rate-limiting
	let lastSubmit = 0;

	function showFieldError(fieldEl, text) {
		let err = fieldEl.parentElement.querySelector('.error-message');
		if (!err) {
			err = document.createElement('div');
			err.className = 'error-message';
			fieldEl.parentElement.appendChild(err);
		}
		err.textContent = text;
		err.classList.add('show');
		fieldEl.setAttribute('aria-invalid', 'true');
	}

	function clearFieldError(fieldEl) {
		const err = fieldEl.parentElement.querySelector('.error-message');
		if (err) err.classList.remove('show');
		fieldEl.removeAttribute('aria-invalid');
	}

	function showFormMessage(container, text, type = 'error') {
		let box = container.querySelector('.form-feedback');
		if (!box) {
			box = document.createElement('div');
			box.className = 'form-feedback';
			container.insertBefore(box, container.firstChild);
		}
		box.textContent = text;
		box.className = `form-feedback ${type}`;
	}

	function clearFormMessage(container) {
		const box = container.querySelector('.form-feedback');
		if (box) box.remove();
	}

	// Try to read CSRF token from meta tag or hidden input
	function getCsrfToken() {
		const meta = document.querySelector('meta[name="csrf-token"]');
		if (meta) return meta.getAttribute('content');
		const input = document.querySelector('input[name="_csrf"]');
		if (input) return input.value;
		return null;
	}

	// Perform client-side validation, returns normalized data or null
	function validateForm(form) {
		const data = {};
		let valid = true;

		const nameEl = form.querySelector('#name');
		const emailEl = form.querySelector('#email');
		const levelEl = form.querySelector('#level');
		const messageEl = form.querySelector('#message');

		const rawName = sanitizeText(nameEl.value);
		const rawEmail = sanitizeText(emailEl.value.toLowerCase());
		const rawLevel = sanitizeText(levelEl.value);
		const rawMessage = sanitizeText(messageEl.value);

		if (!validators.name(rawName)) {
			showFieldError(nameEl, messages.name);
			valid = false;
		} else clearFieldError(nameEl);

		if (!validators.email(rawEmail)) {
			showFieldError(emailEl, messages.email);
			valid = false;
		} else clearFieldError(emailEl);

		if (!validators.level(rawLevel)) {
			showFieldError(levelEl, messages.level);
			valid = false;
		} else clearFieldError(levelEl);

		if (!validators.message(rawMessage)) {
			showFieldError(messageEl, messages.message);
			valid = false;
		} else clearFieldError(messageEl);

		if (!valid) return null;

		data.name = rawName;
		data.email = rawEmail;
		data.level = rawLevel;
		data.message = rawMessage;
		return data;
	}

	// Submit using fetch with JSON payload; returns response JSON
	async function submitForm(form, data) {
		const container = form.closest('.form-section') || form;
		clearFormMessage(container);

		// Rate-limit locally
		const now = Date.now();
		if (now - lastSubmit < RATE_LIMIT_MS) {
			showFormMessage(container, 'Please wait a moment before submitting again.', 'error');
			return null;
		}
		lastSubmit = now;

		// Build fetch options
		const headers = new Headers({
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		});
		const csrf = getCsrfToken();
		if (csrf) headers.append('X-CSRF-Token', csrf);

		try {
			const resp = await fetch(submitUrl, {
				method: 'POST',
				credentials: 'same-origin',
				headers,
				body: JSON.stringify(data),
			});

			if (!resp.ok) {
				const text = await resp.text();
				showFormMessage(container, `Server error: ${resp.status} ${resp.statusText}`);
				console.error('Form submit error:', resp.status, text);
				return null;
			}

			const json = await resp.json().catch(() => null);
			return json || { success: true };
		} catch (err) {
			console.error('Network error:', err);
			showFormMessage(container, 'Network error while sending the message. Try again later.');
			return null;
		}
	}

	// Wire up the form on DOM ready
	function init() {
		const form = document.querySelector(formSelector) || document.querySelector('form[action="/submit-contact"]') || document.querySelector('form');
		if (!form) return;

		// Provide accessible error containers for existing fields
		['#name', '#email', '#level', '#message'].forEach(sel => {
			const el = document.querySelector(sel);
			if (!el) return;
			const wrapper = el.parentElement;
			let err = wrapper.querySelector('.error-message');
			if (!err) {
				err = document.createElement('div');
				err.className = 'error-message';
				wrapper.appendChild(err);
			}
		});

		form.addEventListener('submit', async (ev) => {
			ev.preventDefault();
			clearFormMessage(form);

			const validData = validateForm(form);
			if (!validData) {
				showFormMessage(form, 'Please fix the highlighted errors and try again.', 'error');
				return;
			}

			// Provide a short UX loading state
			const submitBtn = form.querySelector('.submit-btn');
			if (submitBtn) {
				submitBtn.setAttribute('disabled', '');
				submitBtn.style.opacity = '0.7';
			}

			const result = await submitForm(form, validData);
			if (result && result.success) {
				showFormMessage(form, 'Message sent — thank you!', 'success');
				form.reset();
			} else if (result && result.error) {
				showFormMessage(form, result.error || 'Unable to submit form');
			}

			if (submitBtn) {
				submitBtn.removeAttribute('disabled');
				submitBtn.style.opacity = '';
			}
		});

		// Real-time validation on blur
		['#name', '#email', '#level', '#message'].forEach(sel => {
			const el = document.querySelector(sel);
			if (!el) return;
			el.addEventListener('blur', () => {
				const clone = {};
				clone[el.id] = sanitizeText(el.value || '');
				// run corresponding validator
				if (!validators[el.id] || !validators[el.id](clone[el.id])) {
					showFieldError(el, messages[el.id]);
				} else {
					clearFieldError(el);
				}
			});
		});
	}

	// Initialize when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

})();

 