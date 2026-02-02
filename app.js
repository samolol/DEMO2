const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const toast = document.getElementById('toast');

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
};

const handleScroll = () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
};

window.addEventListener('scroll', handleScroll);
handleScroll();

navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const tabButtons = document.querySelectorAll('.tab');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    tabButtons.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    tabPanels.forEach((panel) => panel.classList.remove('active'));

    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    tabPanels[index].classList.add('active');
    tabPanels[index].focus();
  });
});

const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-nav.prev');
const lightboxNext = document.querySelector('.lightbox-nav.next');
let currentIndex = 0;
let lastFocused = null;

const openLightbox = (index) => {
  currentIndex = index;
  lastFocused = document.activeElement;
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  updateLightbox();
  lightboxImage.focus();
};

const closeLightbox = () => {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  if (lastFocused) {
    lastFocused.focus();
  }
};

const updateLightbox = () => {
  const item = galleryItems[currentIndex];
  lightboxImage.src = item.dataset.src;
  lightboxImage.alt = item.dataset.alt || `Galerie ${currentIndex + 1}`;
};

const changeSlide = (direction) => {
  currentIndex = (currentIndex + direction + galleryItems.length) % galleryItems.length;
  updateLightbox();
};

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => changeSlide(-1));
lightboxNext.addEventListener('click', () => changeSlide(1));

lightbox.addEventListener('click', (event) => {
  if (event.target.closest('.lightbox-content')) return;
  closeLightbox();
});

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
});

const handleLightboxKey = (event) => {
  if (lightbox.getAttribute('aria-hidden') === 'true') return;

  if (event.key === 'Escape') {
    closeLightbox();
  }

  if (event.key === 'ArrowLeft') {
    changeSlide(-1);
  }

  if (event.key === 'ArrowRight') {
    changeSlide(1);
  }

  if (event.key === 'Tab') {
    const focusable = lightbox.querySelectorAll('button, [tabindex="0"]');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
};

document.addEventListener('keydown', handleLightboxKey);

const slider = document.querySelector('.review-track');
const dots = Array.from(document.querySelectorAll('.dot'));
let reviewIndex = 0;
let startX = null;
let sliderInterval = null;

const updateSlider = (index) => {
  reviewIndex = index;
  slider.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === index);
    dot.setAttribute('aria-selected', dotIndex === index ? 'true' : 'false');
  });
};

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => updateSlider(index));
});

const startSlider = () => {
  if (sliderInterval) return;
  sliderInterval = setInterval(() => {
    updateSlider((reviewIndex + 1) % dots.length);
  }, 5000);
};

const stopSlider = () => {
  if (!sliderInterval) return;
  clearInterval(sliderInterval);
  sliderInterval = null;
};

const reviewSlider = document.querySelector('.review-slider');
reviewSlider.addEventListener('mouseenter', stopSlider);
reviewSlider.addEventListener('mouseleave', startSlider);
reviewSlider.addEventListener('focusin', stopSlider);
reviewSlider.addEventListener('focusout', startSlider);

slider.addEventListener('touchstart', (event) => {
  startX = event.touches[0].clientX;
});

slider.addEventListener('touchend', (event) => {
  if (startX === null) return;
  const endX = event.changedTouches[0].clientX;
  const diff = startX - endX;
  if (Math.abs(diff) > 40) {
    const nextIndex = diff > 0 ? reviewIndex + 1 : reviewIndex - 1;
    updateSlider((nextIndex + dots.length) % dots.length);
  }
  startX = null;
});

startSlider();

const reservationForm = document.getElementById('reservation-form');
const reservationSuccess = document.getElementById('reservation-success');
const newReservation = document.getElementById('new-reservation');

const errorMap = {
  date: document.getElementById('error-date'),
  time: document.getElementById('error-time'),
  guests: document.getElementById('error-guests'),
  name: document.getElementById('error-name'),
  email: document.getElementById('error-email'),
};

const clearErrors = () => {
  Object.keys(errorMap).forEach((key) => {
    const field = document.getElementById(key);
    field.removeAttribute('aria-invalid');
    errorMap[key].textContent = '';
  });
};

const setError = (fieldName, message) => {
  const field = document.getElementById(fieldName);
  field.setAttribute('aria-invalid', 'true');
  errorMap[fieldName].textContent = message;
};

reservationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();
  const formData = new FormData(reservationForm);
  const required = ['date', 'time', 'guests', 'name', 'email'];
  const missing = required.filter((field) => !formData.get(field));

  if (missing.length > 0) {
    missing.forEach((field) => setError(field, 'Toto pole je povinné.'));
    showToast('Vyplňte prosím všechna povinná pole.');
    return;
  }

  const email = formData.get('email');
  if (!/\S+@\S+\.\S+/.test(email)) {
    setError('email', 'Zadejte platný email.');
    showToast('Zadejte platný email.');
    return;
  }

  const submitButton = reservationForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Odesílám...';

  setTimeout(() => {
    reservationForm.reset();
    reservationForm.hidden = true;
    reservationSuccess.hidden = false;
    submitButton.disabled = false;
    submitButton.textContent = 'Odeslat rezervaci';
    showToast('Rezervace úspěšně odeslána.');
  }, 800);
});

newReservation.addEventListener('click', () => {
  reservationForm.hidden = false;
  reservationSuccess.hidden = true;
});

const copyButton = document.getElementById('copy-address');
const address = document.getElementById('address');

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(address.textContent.trim());
    showToast('Adresa zkopírována.');
  } catch (error) {
    showToast('Kopírování se nezdařilo.');
  }
});
