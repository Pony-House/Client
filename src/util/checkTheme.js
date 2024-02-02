export function isBottomPage() {
  return window.innerHeight + Math.round(window.scrollY) >= document.body.offsetHeight;
}

export function selectButton() {
  const body = $('body');
  if (body.length > 0) {
    if (body.hasClass('theme-type-dark') || body.hasClass('theme-type-dark-solid')) {
      return 'dark';
    }

    if (body.hasClass('theme-type-dark2') || body.hasClass('theme-type-dark2-solid')) {
      return 'secondary';
    }
  }

  return 'light';
}

export function selectButtonInverse() {
  const body = $('body');
  if (body.length > 0) {
    if (
      body.hasClass('theme-type-dark') ||
      body.hasClass('theme-type-dark-solid') ||
      body.hasClass('theme-type-dark2') ||
      body.hasClass('theme-type-dark2-solid') ||
      body.hasClass('theme-type-silver') ||
      body.hasClass('theme-type-silver-solid')
    ) {
      return 'secondary';
    }
  }

  return 'light';
}
