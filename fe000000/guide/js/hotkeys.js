window.addEventListener('keydown', function(event) {
  let controlDown = event.ctrlKey || event.metaKey;
  let shiftDown = event.shiftKey;
  if ((player && !player.options.hotkeys) || controlDown || (document.activeElement && document.activeElement.type === 'text')) return false;
  const tmp = event.keyCode;
  switch (tmp) {
    case 66: // B
      scrollToBottom();
    break;
    
    case 84: // T
      scrollToTop();
    break;
  }
}, false);

let scrollToTop = function () {
  window.scrollTo(0, 0);
}

let scrollToBottom = function () {
  window.scrollTo(0, document.body.scrollHeight);
}
