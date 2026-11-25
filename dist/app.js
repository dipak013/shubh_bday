/*
 * Add your photos here. Put image files in dist/assets/photos/ and set src,
 * alt and position for each slot. Empty src values display styled placeholders.
 * Example: { src: './assets/photos/photo-1.jpg', alt: 'Shubh smiling outdoors', position: '50% 35%' }
 */
const photos = [
  { src: '', alt: '', position: '50% 50%' },
  { src: '', alt: '', position: '50% 50%' },
  { src: '', alt: '', position: '50% 50%' },
  { src: '', alt: '', position: '50% 50%' },
];

const body = document.body;
const openButton = document.getElementById('open-button');
const continueLink = document.getElementById('continue-link');
const replayButton = document.getElementById('replay-button');
const surpriseCard = document.getElementById('surprise-card');
const memories = document.getElementById('memories');
const closing = document.getElementById('closing');
const photoGrid = document.getElementById('photo-grid');
const galleryNote = document.getElementById('gallery-note');
const confettiLayer = document.querySelector('.confetti');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let openingTimer = null;
let isOpening = false;
let scrollObserver = null;

function createGallery() {
  photoGrid.replaceChildren();
  let loadedPhotos = 0;

  photos.forEach((photo, index) => {
    const figure = document.createElement('figure');
    figure.className = `photo-card photo-card-${index + 1} reveal-on-scroll`;

    const frame = document.createElement('div');
    frame.className = 'photo-frame';

    const placeholder = document.createElement('div');
    placeholder.className = 'photo-placeholder';
    placeholder.innerHTML = '<span class="placeholder-spark" aria-hidden="true">✦</span><span>YOUR PHOTO<br>GOES HERE</span>';
    frame.append(placeholder);

    if (photo.src) {
      const image = document.createElement('img');
      image.src = photo.src;
      image.alt = photo.alt || `Birthday photo ${index + 1}`;
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';
      image.style.objectPosition = photo.position || '50% 50%';
      image.addEventListener('load', () => {
        figure.classList.add('has-image');
        loadedPhotos += 1;
        if (loadedPhotos > 0) galleryNote.hidden = true;
      });
      image.addEventListener('error', () => {
        image.remove();
        figure.classList.add('image-error');
        placeholder.lastElementChild.innerHTML = 'PHOTO<br>UNAVAILABLE';
      });
      frame.append(image);
    }

    const caption = document.createElement('figcaption');
    caption.textContent = `A little moment · ${String(index + 1).padStart(2, '0')}`;
    figure.append(frame, caption);
    photoGrid.append(figure);
  });
}

function makeConfetti() {
  confettiLayer.replaceChildren();
  if (reducedMotion.matches) return;

  const colors = ['#f5d69d', '#f2bfcf', '#d8c7ff', '#fff7e7'];
  for (let i = 0; i < 30; i += 1) {
    const piece = document.createElement('i');
    piece.style.setProperty('--x', `${(Math.random() - 0.5) * 530}px`);
    piece.style.setProperty('--y', `${Math.random() * 230 + 70}px`);
    piece.style.setProperty('--r', `${Math.random() * 600 - 300}deg`);
    piece.style.setProperty('--delay', `${Math.random() * 0.45}s`);
    piece.style.setProperty('--color', colors[i % colors.length]);
    piece.style.setProperty('--size', `${Math.random() * 5 + 5}px`);
    confettiLayer.append(piece);
  }
}

function prepareScrollReveals() {
  if (scrollObserver) scrollObserver.disconnect();
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 50px 0px' });
  elements.forEach((element) => scrollObserver.observe(element));
}

function completeOpening() {
  openingTimer = null;
  body.dataset.state = 'revealed';
  surpriseCard.setAttribute('aria-hidden', 'false');
  memories.hidden = false;
  closing.hidden = false;
  continueLink.hidden = false;
  openButton.hidden = true;
  openButton.setAttribute('aria-expanded', 'true');
  prepareScrollReveals();
  isOpening = false;
  surpriseCard.focus({ preventScroll: true });
}

function openSurprise() {
  if (isOpening || body.dataset.state !== 'closed') return;
  isOpening = true;
  openButton.disabled = true;
  body.dataset.state = 'opening';
  makeConfetti();
  openingTimer = window.setTimeout(completeOpening, reducedMotion.matches ? 120 : 1900);
}

function replaySurprise() {
  window.clearTimeout(openingTimer);
  openingTimer = null;
  isOpening = false;
  if (scrollObserver) scrollObserver.disconnect();
  confettiLayer.replaceChildren();
  body.dataset.state = 'closed';
  surpriseCard.setAttribute('aria-hidden', 'true');
  memories.hidden = true;
  closing.hidden = true;
  continueLink.hidden = true;
  openButton.hidden = false;
  openButton.disabled = false;
  openButton.setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  window.setTimeout(() => openButton.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 450);
}

createGallery();
openButton.addEventListener('click', openSurprise);
replayButton.addEventListener('click', replaySurprise);
