// Photo order and short messages are kept together so the story is easy to edit.
// The original files stay in img/; this page uses optimized copies.
const photos = [
  {
    src: './assets/photos/img5.jpg', alt: 'Shubh in a green sari with a floral backdrop',
    desktopPosition: '50% 32%', mobilePosition: '50% 50%',
    label: 'For Shubh', eyebrow: 'A day in full bloom', title: 'Happy Birthday,', accent: 'Shubh!',
    message: 'Wishing you bright moments and countless reasons to smile.',
  },
  {
    src: './assets/photos/img6.jpg', alt: 'Shubh wearing sunglasses outdoors',
    desktopPosition: '50% 34%', mobilePosition: '58% 50%',
    label: 'New horizons', eyebrow: 'Fresh air, fresh beginnings', title: 'Bright days', accent: 'ahead.',
    message: 'May every new day bring a beautiful surprise.',
  },
  {
    src: './assets/photos/img3.jpg', alt: 'Shubh in a flowing mint outfit',
    desktopPosition: '50% 18%', mobilePosition: '70% 50%',
    label: 'In motion', eyebrow: 'Your own kind of magic', title: 'Keep the', accent: 'magic moving.',
    message: 'Here’s to moments that feel light, free, and full of life.',
  },
  {
    src: './assets/photos/img4.jpg', alt: 'Shubh standing in a warmly lit hall',
    desktopPosition: '50% 42%', mobilePosition: '55% 50%',
    label: 'Golden moments', eyebrow: 'A little golden glow', title: 'Make today', accent: 'yours.',
    message: 'Some days deserve to be remembered. Let this be one.',
  },
  {
    src: './assets/photos/img2.jpg', alt: 'Shubh beside a bright yellow wall',
    desktopPosition: '50% 44%', mobilePosition: '51% 50%',
    label: 'A little sunshine', eyebrow: 'Color in every corner', title: 'More joy,', accent: 'always.',
    message: 'May the year ahead be colorful in all the right ways.',
  },
  {
    src: './assets/photos/img1.jpg', alt: 'A close-up of Shubh’s eyes',
    desktopPosition: '50% 50%', mobilePosition: '50% 50%', kind: 'detail',
    label: 'One more moment', eyebrow: 'A little wonder remains', title: 'The story', accent: 'continues.',
    message: 'There is so much still to look forward to.',
  },
];

const body = document.body;
const hero = document.querySelector('.hero');
const openButton = document.getElementById('open-button');
const replayButton = document.getElementById('replay-button');
const surpriseCard = document.getElementById('surprise-card');
const cardSeconds = document.getElementById('card-seconds');
const cardStatus = document.getElementById('card-status');
const memories = document.getElementById('memories');
const confettiLayer = document.querySelector('.confetti');
const storyStage = document.getElementById('story-stage');
const storySlides = document.getElementById('story-slides');
const storyCount = document.getElementById('story-count');
const storyProgress = document.getElementById('story-progress');
const storyStatus = document.getElementById('story-status');
const storySignatureLabel = document.getElementById('story-signature-label');
const storyEyebrow = document.getElementById('story-eyebrow');
const storyTitleMain = document.getElementById('story-title-main');
const storyTitleAccent = document.getElementById('story-title-accent');
const storyMessage = document.getElementById('story-message');
const storyCopy = document.getElementById('story-copy');
const storyControlLabel = document.getElementById('story-control-label');
const storyPauseHint = document.getElementById('story-pause-hint');
const finaleContent = document.getElementById('finale-content');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const birthdayAudio = document.getElementById('birthday-audio');
const musicToggle = document.getElementById('music-toggle');
const musicLabel = document.getElementById('music-label');
const musicStatus = document.getElementById('music-status');
const musicVolume = 0.38;

birthdayAudio.volume = musicVolume;

const slides = [];
const progressSegments = [];
let currentIndex = 0;
let openingTimer = null;
let cardHoldTimer = null;
let cardCountdownInterval = null;
let cardReadDeadline = 0;
let isCardReading = false;
let resetTimer = null;
let slideTimer = null;
let holdTimer = null;
let isOpening = false;
let isResetting = false;
let userPaused = false;
let manualHoldUntil = 0;
let swipeStart = null;
let cardSwipeStart = null;
let suppressClickUntil = 0;
let wheelLockUntil = 0;
let musicWanted = false;
let musicRequest = 0;
let musicFadeFrame = null;
let musicContext = null;
let musicGain = null;

function prepareMusicOutput() {
  if (musicContext) return;
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  try {
    musicContext = new Context();
    const source = musicContext.createMediaElementSource(birthdayAudio);
    musicGain = musicContext.createGain();
    source.connect(musicGain);
    musicGain.connect(musicContext.destination);
    birthdayAudio.volume = 1;
    musicGain.gain.value = musicVolume;
  } catch {
    musicContext = null;
    musicGain = null;
    birthdayAudio.volume = musicVolume;
  }
}

function getMusicVolume() {
  return musicGain ? musicGain.gain.value : birthdayAudio.volume;
}

function setMusicVolume(value) {
  if (musicGain) musicGain.gain.value = value;
  else birthdayAudio.volume = value;
}

function updateMusicButton() {
  musicToggle.classList.toggle('is-playing', musicWanted);
  musicToggle.setAttribute('aria-pressed', String(musicWanted));
  musicToggle.setAttribute('aria-label', musicWanted ? 'Mute background music' : 'Play background music');
  musicLabel.textContent = musicWanted ? 'Mute music' : 'Play music';
}

function cancelMusicFade() {
  if (musicFadeFrame !== null) window.cancelAnimationFrame(musicFadeFrame);
  musicFadeFrame = null;
}

function fadeMusicOut(duration = 1400, reset = false) {
  cancelMusicFade();
  if (birthdayAudio.paused) {
    musicWanted = false;
    if (reset) birthdayAudio.currentTime = 0;
    updateMusicButton();
    return;
  }
  const startVolume = getMusicVolume();
  const startTime = performance.now();
  const step = (now) => {
    const amount = Math.min(1, (now - startTime) / duration);
    setMusicVolume(startVolume * (1 - amount));
    if (amount < 1) {
      musicFadeFrame = window.requestAnimationFrame(step);
    } else {
      musicFadeFrame = null;
      birthdayAudio.pause();
      if (reset) birthdayAudio.currentTime = 0;
      setMusicVolume(musicVolume);
      musicWanted = false;
      updateMusicButton();
      musicStatus.textContent = 'Background music stopped';
    }
  };
  musicFadeFrame = window.requestAnimationFrame(step);
}

async function toggleMusic() {
  const request = ++musicRequest;
  cancelMusicFade();
  if (musicWanted) {
    musicWanted = false;
    birthdayAudio.pause();
    setMusicVolume(musicVolume);
    updateMusicButton();
    musicStatus.textContent = 'Background music muted';
    return;
  }
  musicWanted = true;
  prepareMusicOutput();
  setMusicVolume(musicVolume);
  updateMusicButton();
  try {
    const resume = musicContext?.state === 'suspended' ? musicContext.resume() : Promise.resolve();
    await Promise.all([resume, birthdayAudio.play()]);
    if (request !== musicRequest) {
      if (!musicWanted) birthdayAudio.pause();
      return;
    }
    musicStatus.textContent = 'Background music playing';
  } catch {
    if (request !== musicRequest) return;
    musicWanted = false;
    updateMusicButton();
    musicStatus.textContent = 'Music could not be played';
  }
}

function slideDuration(index = currentIndex) {
  return photos[index]?.kind === 'detail' ? 2600 : 3300;
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
    slides.push(slide);
  });

  for (let index = 0; index <= photos.length; index += 1) {
    const segment = document.createElement('span');
    segment.className = `story-progress-segment${index === 0 ? ' is-active' : ''}`;
    segment.append(document.createElement('i'));
    storyProgress.append(segment);
    progressSegments.push(segment);
  }
  updateScene(0, false);
}

function canRotate() {
  return body.dataset.state === 'revealed' && !memories.hidden && !document.hidden &&
    !reducedMotion.matches && !userPaused && currentIndex < photos.length;
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
  const fill = progressSegments[currentIndex].firstElementChild;
  fill.style.animation = 'none';
  void fill.offsetWidth;
  fill.style.animation = '';
  storyStage.classList.add('is-playing');
  slideTimer = window.setTimeout(() => updateScene(currentIndex + 1, false), slideDuration());
}

function updateHints() {
  if (currentIndex === photos.length) return;
  storyControlLabel.textContent = userPaused ? 'Paused · swipe to continue' : 'Swipe left or scroll down to continue';
  storyPauseHint.textContent = reducedMotion.matches
    ? 'Use arrow keys on a keyboard'
    : (userPaused ? 'Tap center to resume' : 'Tap center to pause');
}

function updateScene(index, announce) {
  currentIndex = Math.max(0, Math.min(index, photos.length));
  const isFinale = currentIndex === photos.length;
  storyStage.classList.toggle('is-finale', isFinale);
  finaleContent.inert = !isFinale;
  finaleContent.setAttribute('aria-hidden', String(!isFinale));
  slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', !isFinale && slideIndex === currentIndex));
  progressSegments.forEach((segment, segmentIndex) => {
    segment.classList.toggle('is-active', segmentIndex === currentIndex);
    segment.classList.toggle('is-complete', segmentIndex < currentIndex);
  });

  if (isFinale) {
    if (musicWanted) fadeMusicOut();
    storyStage.setAttribute('aria-label', 'Final birthday wish. Replay the surprise to start again.');
    storyStatus.textContent = 'Final birthday wish. The best moments are still ahead.';
  } else {
    const photo = photos[currentIndex];
    storySignatureLabel.textContent = photo.label;
    storyEyebrow.textContent = photo.eyebrow;
    storyTitleMain.textContent = photo.title;
    storyTitleAccent.textContent = photo.accent;
    storyMessage.textContent = photo.message;
    storyCopy.classList.remove('is-changing');
    void storyCopy.offsetWidth;
    storyCopy.classList.add('is-changing');
    storyCount.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    storyStage.setAttribute('aria-label', `Birthday photo ${currentIndex + 1} of ${photos.length}: ${photo.alt}. Swipe left or up, scroll down, or tap the right side for the next scene. Press Space to pause.`);
    if (announce) storyStatus.textContent = `Photo ${currentIndex + 1} of ${photos.length}: ${photo.alt}`;
    updateHints();
  }
  scheduleRotation();
}

function chooseScene(index) {
  if (index < 0 || index > photos.length || index === currentIndex) return;
  manualHoldUntil = Date.now() + slideDuration(index);
  updateScene(index, true);
}

function togglePause() {
  if (reducedMotion.matches || currentIndex === photos.length) return;
  userPaused = !userPaused;
  manualHoldUntil = 0;
  updateHints();
  storyStatus.textContent = userPaused ? 'Photo story paused' : 'Photo story playing';
  scheduleRotation();
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

function clearCardReading() {
  window.clearTimeout(openingTimer);
  window.clearTimeout(cardHoldTimer);
  window.clearInterval(cardCountdownInterval);
  openingTimer = null;
  cardHoldTimer = null;
  cardCountdownInterval = null;
  cardReadDeadline = 0;
  isCardReading = false;
  body.classList.remove('card-reading');
  surpriseCard.classList.remove('is-reading');
  cardSeconds.textContent = '10';
  cardStatus.textContent = '';
}

function beginCardReading() {
  openingTimer = null;
  if (body.dataset.state !== 'opening' || !isOpening) return;
  isCardReading = true;
  cardReadDeadline = Date.now() + 10000;
  body.classList.add('card-reading');
  surpriseCard.classList.add('is-reading');
  surpriseCard.setAttribute('aria-hidden', 'false');
  cardStatus.textContent = 'Happy Birthday, Shubh! The next photograph appears in ten seconds. Swipe or press Right Arrow to continue sooner.';
  cardCountdownInterval = window.setInterval(() => {
    cardSeconds.textContent = String(Math.max(1, Math.ceil((cardReadDeadline - Date.now()) / 1000)));
  }, 200);
  cardHoldTimer = window.setTimeout(revealStory, 10000);
}

function skipCard() {
  if (isCardReading) revealStory();
}

function revealStory() {
  clearCardReading();
  body.dataset.state = 'revealed';
  hero.setAttribute('aria-hidden', 'true');
  surpriseCard.setAttribute('aria-hidden', 'true');
  memories.hidden = false;
  memories.removeAttribute('aria-hidden');
  openButton.hidden = true;
  openButton.setAttribute('aria-expanded', 'true');
  isOpening = false;
  manualHoldUntil = Date.now() + (reducedMotion.matches ? 0 : 350);
  updateScene(0, false);
  window.requestAnimationFrame(() => memories.classList.add('is-visible'));
  storyStage.focus({ preventScroll: true });
}

function openSurprise() {
  if (isOpening || isResetting || body.dataset.state !== 'closed') return;
  isOpening = true;
  openButton.disabled = true;
  body.dataset.state = 'opening';
  void toggleMusic();
  makeConfetti();
  openingTimer = window.setTimeout(reducedMotion.matches ? revealStory : beginCardReading, reducedMotion.matches ? 120 : 2800);
}

function replaySurprise() {
  if (isResetting) return;
  isResetting = true;
  clearCardReading();
  stopRotation();
  ++musicRequest;
  fadeMusicOut(600, true);
  userPaused = false;
  manualHoldUntil = 0;
  body.dataset.state = 'closed';
  hero.removeAttribute('aria-hidden');
  memories.setAttribute('aria-hidden', 'true');
  memories.classList.remove('is-visible');
  surpriseCard.setAttribute('aria-hidden', 'true');
  confettiLayer.replaceChildren();
  openButton.hidden = false;
  openButton.disabled = false;
  openButton.setAttribute('aria-expanded', 'false');
  updateScene(0, false);
  window.clearTimeout(resetTimer);
  resetTimer = window.setTimeout(() => {
    memories.hidden = true;
    isResetting = false;
    openButton.focus({ preventScroll: true });
  }, reducedMotion.matches ? 20 : 650);
}

buildStory();
openButton.addEventListener('click', openSurprise);
replayButton.addEventListener('click', replaySurprise);
musicToggle.addEventListener('click', toggleMusic);
birthdayAudio.addEventListener('error', () => {
  ++musicRequest;
  cancelMusicFade();
  musicWanted = false;
  updateMusicButton();
  musicStatus.textContent = 'Music is unavailable';
});

hero.addEventListener('click', (event) => {
  if (isCardReading && event.clientX >= window.innerWidth * 0.7) skipCard();
});
hero.addEventListener('touchstart', (event) => {
  const touch = event.changedTouches[0];
  cardSwipeStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });
hero.addEventListener('touchend', (event) => {
  if (!isCardReading || !cardSwipeStart) return;
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - cardSwipeStart.x;
  const deltaY = touch.clientY - cardSwipeStart.y;
  cardSwipeStart = null;
  const horizontal = Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1;
  const upward = deltaY < -65 && Math.abs(deltaY) > Math.abs(deltaX) * 1.1;
  if (horizontal || upward) {
    suppressClickUntil = Date.now() + 650;
    skipCard();
  }
}, { passive: true });
hero.addEventListener('touchcancel', () => { cardSwipeStart = null; });
hero.addEventListener('wheel', (event) => {
  if (!isCardReading) return;
  const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
  if (Math.abs(delta) < 30) return;
  event.preventDefault();
  skipCard();
}, { passive: false });
document.addEventListener('keydown', (event) => {
  if (!isCardReading) return;
  if (['ArrowRight', 'ArrowDown', 'PageDown', 'Enter', ' '].includes(event.key)) {
    event.preventDefault();
    skipCard();
  }
});

storyStage.addEventListener('keydown', (event) => {
  if (event.target.closest('button')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'PageDown') {
    event.preventDefault(); chooseScene(currentIndex + 1);
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'PageUp') {
    event.preventDefault(); chooseScene(currentIndex - 1);
  } else if (event.key === 'Home') {
    event.preventDefault(); chooseScene(0);
  } else if (event.key === 'End') {
    event.preventDefault(); chooseScene(photos.length);
  } else if (event.key === ' ' || event.key === 'Spacebar') {
    event.preventDefault(); togglePause();
  }
});

storyStage.addEventListener('click', (event) => {
  if (event.target.closest('button') || Date.now() < suppressClickUntil) return;
  const fraction = event.clientX / window.innerWidth;
  if (fraction >= 0.7) chooseScene(currentIndex + 1);
  else if (fraction <= 0.3) chooseScene(currentIndex - 1);
  else togglePause();
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
  const horizontal = Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1;
  const vertical = Math.abs(deltaY) > 65 && Math.abs(deltaY) > Math.abs(deltaX) * 1.1;
  if (horizontal || vertical) {
    suppressClickUntil = Date.now() + 600;
    chooseScene(currentIndex + ((horizontal ? deltaX : deltaY) < 0 ? 1 : -1));
  }
}, { passive: true });
storyStage.addEventListener('touchcancel', () => { swipeStart = null; });

storyStage.addEventListener('wheel', (event) => {
  if (memories.hidden) return;
  event.preventDefault();
  if (Date.now() < wheelLockUntil) return;
  const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
  if (Math.abs(delta) < 25) return;
  wheelLockUntil = Date.now() + 1100;
  chooseScene(currentIndex + (delta > 0 ? 1 : -1));
}, { passive: false });

document.addEventListener('visibilitychange', () => {
  scheduleRotation();
  if (document.hidden) birthdayAudio.pause();
  else if (musicWanted && musicFadeFrame === null) {
    const resume = musicContext?.state === 'suspended' ? musicContext.resume() : Promise.resolve();
    Promise.all([resume, birthdayAudio.play()]).catch(() => {
      musicWanted = false;
      updateMusicButton();
    });
  }
});
reducedMotion.addEventListener('change', () => { updateHints(); scheduleRotation(); });
