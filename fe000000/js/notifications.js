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
    setTimeout(remove, 16000);
  }
}