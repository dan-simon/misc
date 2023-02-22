let Notifications = {
  wrapper: {
    'achievements': name => 'Achievement unlocked: ' + name,
    'complexityAchievements': name => 'Complexity achievement unlocked: ' + name,
    'saveLoad': name => name
  },
  canNotify(type) {
    return Options.showNotifications(type);
  },
  notify(name, type) {
    if (player.oracle.isPredicting || !this.canNotify(type)) return;
    let e = document.createElement('div');
    e.className = 'notification';
    e.innerText = this.wrapper[type](name);
    document.getElementById('notificationarea').appendChild(e);
    let remove = function() {
      if (document.body.contains(e)) {
        document.getElementById('notificationarea').removeChild(e);
      }
    };
    e.onclick = remove;
    setTimeout(remove, 16384);
    if (document.getElementById('notificationarea').children.length >= 4 &&
    document.getElementById('notificationarea').children[0].className !== 'notification removal') {
      this.addRemoveAll();
    }
  },
  addRemoveAll() {
    let e = document.createElement('div');
    e.className = 'notification removal';
    e.innerText = 'Click this to clear all notifications immediately';
    document.getElementById('notificationarea').insertBefore(e, document.getElementById('notificationarea').children[0]);
    let remove = function() {
      if (document.body.contains(e)) {
        document.getElementById('notificationarea').removeChild(e);
      }
    };
    let removeAll = function() {
      document.getElementById('notificationarea').textContent = '';
    };
    e.onclick = removeAll;
    setTimeout(remove, 16384);
  }
}