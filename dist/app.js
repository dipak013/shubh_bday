// The presentation order is intentional: five portraits, then the eye detail.
// Originals stay in img/. Optimized, carefully cropped copies are in assets/photos/.
const photos = [
  { src: './assets/photos/img5.jpg', alt: 'Shubh in a green sari with a floral backdrop', desktopPosition: '50% 32%', mobilePosition: '50% 50%' },
  { src: './assets/photos/img6.jpg', alt: 'Shubh wearing sunglasses outdoors', desktopPosition: '50% 34%', mobilePosition: '58% 50%' },
  { src: './assets/photos/img3.jpg', alt: 'Shubh in a flowing mint outfit', desktopPosition: '50% 18%', mobilePosition: '70% 50%' },
  { src: './assets/photos/img4.jpg', alt: 'Shubh standing in a warmly lit hall', desktopPosition: '50% 42%', mobilePosition: '55% 50%' },
  { src: './assets/photos/img2.jpg', alt: 'Shubh beside a bright yellow wall', desktopPosition: '50% 44%', mobilePosition: '51% 50%' },
  { src: './assets/photos/img1.jpg', alt: 'A close-up of Shubh’s eyes', desktopPosition: '50% 50%', mobilePosition: '50% 50%', kind: 'detail' },
];

const body = document.body;
const openButton = document.getElementById('open-button');
const continueLink = document.getElementById('continue-link');
const replayButton = document.getElementById('replay-button');
const surpriseCard = document.getElementById('surprise-card');
const memories = document.getElementById('memories');
const closing = document.getElementById('closing');
const confettiLayer = document.querySelector('.confetti');
const storyStage = document.getElementById('story-stage');
const storySlides = document.getElementById('story-slides');
const storyCount = document.getElementById('story-count');
const storyProgress = document.getElementById('story-progress');
const storyStatus = document.getElementById('story-status');
const filmstrip = document.getElementById('filmstrip');
const previousButton = document.getElementById('previous-photo');
const nextButton = document.getElementById('next-photo');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let currentIndex = 0;
let openingTimer = null;
let autoScrollTimer = null;
let slideTimer = null;
let holdTimer = null;
let isOpening = false;
let storyVisible = false;
let pointerHover = false;
let focusInside = false;
let manualHoldUntil = 0;
let scrollObserver = null;
let swipeStart = null;

const slideElements = [];
const thumbnailElements = [];
const progressElements = [];

function slideDuration(index = currentIndex) {
  return photos[index].kind === 'detail' ? 3000 : 4800;
}

function buildStory() {
  photos.forEach((photo, index) => {
    const slide = document.createElement('div');
    slide.className = `story-slide${photo.kind === 'detail' ? ' is-detail' : ''}${index === 0 ? ' is-active' : ''}`;
    slide.style.setProperty('--desktop-position', photo.desktopPosition);
    slide.style.setProperty('--mobile-position', photo.mobilePosition);
    if (photo.kind === 'detail') slide.style.setProperty('--detail-image', `url("${photo.src}")`);

    const image = document.createElement('img');
    image.className = 'story-photo';
    image.src = photo.src;
    image.alt = '';
    image.loading = 'eager';
    image.decoding = 'async';
    image.addEventListener('error', () => slide.classList.add('photo-failed'));
    const fallback = document.createElement('span');
    fallback.className = 'photo-fallback';
    fallback.textContent = 'Photograph unavailable';
    slide.append(image, fallback);
    storySlides.append(slide);
    slideElements.push(slide);

    const segment = document.createElement('span');
    segment.className = `story-progress-segment${index === 0 ? ' is-active' : ''}`;
    segment.append(document.createElement('i'));
    storyProgress.append(segment);
    progressElements.push(segment);

    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = `filmstrip-photo${photo.kind === 'detail' ? ' is-detail' : ''}${index === 0 ? ' is-active' : ''}`;
    thumb.setAttribute('aria-label', `Show photograph ${index + 1} of ${photos.length}: ${photo.alt}`);
    thumb.setAttribute('aria-pressed', String(index === 0));
    const thumbImage = document.createElement('img');
    thumbImage.src = photo.src;
    thumbImage.alt = '';
    thumbImage.loading = 'lazy';
    thumbImage.decoding = 'async';
    thumbImage.addEventListener('error', () => thumb.classList.add('photo-failed'));
    const thumbNumber = document.createElement('span');
    thumbNumber.textContent = String(index + 1).padStart(2, '0');
    thumb.append(thumbImage, thumbNumber);
    thumb.addEventListener('click', () => {
      chooseSlide(index);
      storyStage.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    });
    filmstrip.append(thumb);
    thumbnailElements.push(thumb);
  });
  updateSlide(0, false);
}

function canRotate() {
  return body.dataset.state === 'revealed' && storyVisible && !document.hidden &&
    !reducedMotion.matches && !pointerHover && !focusInside;
}

function stopRotation() {
  window.clearTimeout(slideTimer);
  window.clearTimeout(holdTimer);
  slideTimer = null;
  holdTimer = null;
  storyStage.classList.remove('is-playing');
}

function scheduleRotation() {
  stopRotation();
  if (!canRotate()) return;
  const holdRemaining = manualHoldUntil - Date.now();
  if (holdRemaining > 0) {
    holdTimer = window.setTimeout(scheduleRotation, holdRemaining + 10);
    return;
  }
  storyStage.style.setProperty('--slide-duration', `${slideDuration()}ms`);
  // Recreate the active fill animation so it begins with each photograph.
  const fill = progressElements[currentIndex].firstElementChild;
  fill.style.animation = 'none';
  void fill.offsetWidth;
  fill.style.animation = '';
  storyStage.classList.add('is-playing');
  slideTimer = window.setTimeout(() => updateSlide(currentIndex + 1, false), slideDuration());
}

function updateSlide(index, announce) {
  currentIndex = (index + photos.length) % photos.length;
  slideElements.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === currentIndex));
  progressElements.forEach((segment, segmentIndex) => {
    segment.classList.toggle('is-active', segmentIndex === currentIndex);
    segment.classList.toggle('is-complete', segmentIndex < currentIndex);
  });
  thumbnailElements.forEach((thumb, thumbIndex) => {
    const active = thumbIndex === currentIndex;
    thumb.classList.toggle('is-active', active);
    thumb.setAttribute('aria-pressed', String(active));
  });
  storyCount.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
  storyStage.setAttribute('aria-label', `Birthday photographs, ${currentIndex + 1} of ${photos.length}: ${photos[currentIndex].alt}`);
  if (announce) storyStatus.textContent = `Photograph ${currentIndex + 1} of ${photos.length}: ${photos[currentIndex].alt}`;
  scheduleRotation();
}

function chooseSlide(index) {
  manualHoldUntil = Date.now() + 8000;
  updateSlide(index, true);
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
  if (!reducedMotion.matches) {
    autoScrollTimer = window.setTimeout(() => {
      if (body.dataset.state === 'revealed' && window.scrollY < 100) {
        memories.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 1700);
  }
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
  window.clearTimeout(autoScrollTimer);
  openingTimer = null;
  autoScrollTimer = null;
  isOpening = false;
  manualHoldUntil = 0;
  stopRotation();
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
  updateSlide(0, false);
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  window.setTimeout(() => openButton.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 450);
}

buildStory();
openButton.addEventListener('click', openSurprise);
replayButton.addEventListener('click', replaySurprise);
previousButton.addEventListener('click', () => chooseSlide(currentIndex - 1));
nextButton.addEventListener('click', () => chooseSlide(currentIndex + 1));

storyStage.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') { event.preventDefault(); chooseSlide(currentIndex + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); chooseSlide(currentIndex - 1); }
  if (event.key === 'Home') { event.preventDefault(); chooseSlide(0); }
  if (event.key === 'End') { event.preventDefault(); chooseSlide(photos.length - 1); }
});
storyStage.addEventListener('touchstart', (event) => {
  const touch = event.changedTouches[0];
  swipeStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });
storyStage.addEventListener('touchend', (event) => {
  if (!swipeStart) return;
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - swipeStart.x;
  const deltaY = touch.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
    chooseSlide(currentIndex + (deltaX < 0 ? 1 : -1));
  }
}, { passive: true });
storyStage.addEventListener('touchcancel', () => { swipeStart = null; });
storyStage.addEventListener('pointerenter', (event) => {
  if (event.pointerType === 'mouse') { pointerHover = true; scheduleRotation(); }
});
storyStage.addEventListener('pointerleave', (event) => {
  if (event.pointerType === 'mouse') { pointerHover = false; scheduleRotation(); }
});
storyStage.addEventListener('focusin', () => { focusInside = true; scheduleRotation(); });
storyStage.addEventListener('focusout', () => {
  window.setTimeout(() => {
    focusInside = storyStage.contains(document.activeElement);
    scheduleRotation();
  }, 0);
});
document.addEventListener('visibilitychange', scheduleRotation);
reducedMotion.addEventListener('change', scheduleRotation);

if ('IntersectionObserver' in window) {
  const storyObserver = new IntersectionObserver(([entry]) => {
    storyVisible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
    scheduleRotation();
  }, { threshold: [0, 0.35, 0.6] });
  storyObserver.observe(storyStage);
} else {
  storyVisible = true;
}
