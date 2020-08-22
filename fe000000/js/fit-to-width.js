function maybeFitToWidth() {
  let ratio;
  if (Options.fitToWidth()) {
    let width = window.innerWidth;
    let minWidth = 1376;
    ratio = Math.min(width / minWidth, 1);
  } else {
    ratio = 1;
  }
  document.body.style.zoom = ratio.toString();
  document.body.style['-moz-transform'] = 'scale(' + ratio + ')';
}
