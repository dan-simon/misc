import {Decimal} from './big_number.js';

let copy = function (d) {
  let d2 = {};
  for (let i in d) {
    d2[i] = d[i];
  }
  return d2;
}

let prod = function (x, val_5, g_num_resets) {
  let num_resets = copy(g_num_resets);
  let ten_power = x.max(1).log(10);
  for (let i in num_resets) {
    // Keys are converted to strings, but != is confusing.
    // Also, keys relating to val_5 resets won't be used and so don't matter.
    if (+i !== 10) {
      num_resets[i] *= (1 + ten_power / 1e3) ** num_resets[10];
    }
  }
  console.log(num_resets);
  // Count even mini resets as resets.
  let total_resets = Object.values(num_resets).reduce((x, y) => x + y);
  let two_pow = Decimal.pow(2, num_resets[2]);
  let three_pow = Decimal.pow(x.max(1).decLog(3).max(1), num_resets[3])
  let five_pow = Decimal.pow(val_5.max(1), num_resets[5]);
  let seven_pow = Decimal.pow(Math.max(total_resets, 1), 7 * num_resets[7]);
  return two_pow.times(three_pow).times(five_pow).times(seven_pow);
}

let val_5_prod = function (x, val_5, num_resets) {
  return Decimal.pow(2, num_resets['~2']);
}

let how_many_resets = function (x, val_5, type) {
  if (type === '~2') {
    if (val_5.lte(1)) {
      return 0;
    }
    return Math.max(0, Math.floor((val_5.decLog(2).log(2) - 2) * 4 + 1));
  } else if ([2, 3, 5, 7].includes(+type)) {
    if (x.lte(1)) {
      return 0;
    }
    let div = (+type === 5) ? 5 : 4;
    return Math.max(0, Math.floor((x.decLog(+type).log(+type) - 2) * div + 1));
  } else if (+type === 10) {
    if (x.lt(Decimal.pow(10, 100))) {
      return 0;
    }
    return 1 + Math.floor(((x.log(10) - 100) / 50) ** (1 / 3));
  } else {
    throw new Error('Unknown reset type.');
  }
}

let reset_cost = function (type, num) {
  if (type === '~2') {
    return Decimal.pow(2, Decimal.pow(2, 2 + num / 4));
  } else if ([2, 3, 5, 7].includes(+type)) {
    let div = (+type === 5) ? 5 : 4;
    return Decimal.pow(+type, Decimal.pow(+type, 2 + num / div));
  } else if (+type === 10) {
    return Decimal.pow(10, 100 + 50 * num ** 3);
  } else {
    throw new Error('Unknown reset type.');
  }
}

let get_reset_info = function (x, val_5, resets, type) {
  let num = how_many_resets(x, val_5, type);
  return {
    'num': num,
    'possible': num > resets[type],
    'resets': num - resets[type],
    'cost': reset_cost(type, num - 1),
    'next-cost': reset_cost(type, num),
    'first-cost': reset_cost(type, resets[type])
  }
}

let reset_list = ['~2', '2', '3', '5', '7', '10'];

let reset_name_dict = {
  '~2': 'Mini',
  '2': 'First',
  '3': 'Second',
  '5': 'Third',
  '7': 'Fourth',
  '10': 'Ultimate'
}


let set_reset_text = function (x, val_5, resets, type) {
  let reset_info = get_reset_info(x, val_5, resets, type);
  let el = document.getElementById(type);
  if (!get_reset_exists(type)) {
    el.style.visibility = 'hidden';
  } else if (reset_info.possible) {
    let text = reset_name_dict[type] + ' Reset: do ' + reset_info.resets +
    ' reset' + ((reset_info.resets > 1) ? 's' : '') + ' of this type ' +
    '(cost for next: ' + reset_info['next-cost'].toStr(2) + ')';
    el.style.visibility = 'visible';
    el.style.color = 'green';
    el.innerHTML = text;
  } else {
    let text = reset_name_dict[type] + ' Reset: cannot do ' +
    '(cost for first: ' + reset_info['first-cost'].toStr(2) + ')';
    el.style.visibility = 'visible';
    el.style.color = 'grey';
    el.innerHTML = text;
  }
}

let get_val_5_exists = function () {
  return player.resets[5] > 0;
}

let get_reset_exists = function (type) {
  // You can only do a type of reset if you have done something
  // at least the type below it.
  if (type === '~2') {
    return get_val_5_exists();
  } else if (type === '2') {
    return true;
  } else {
    let i = 1;
    while (i < reset_list.length) {
      if (player.resets[reset_list[i]] > 0 &&
        reset_list.indexOf('' + type) <= i + 1) {
        return true;
      }
      i++;
    }
    return false;
  }
}

let try_to_reset = function (type) {
  let reset_info = get_reset_info(player.x, player.val_5, player.resets, type);
  if (get_reset_exists(type) && reset_info.possible) {
    player.x = new Decimal(0);
    player.val_5 = new Decimal(0);
    for (let i of reset_list) {
      if (i === type || +i === +type) {
        player.resets[i] += reset_info.resets;
        break;
      }
      player.resets[i] = 0;
    }
  } else {
    alert('You can\'t do that type of reset!');
  }
}

let init_player = function () {
  let p = {'x': new Decimal(0), 'val_5': new Decimal(0),
  'resets': {}, 'time': new Date().getTime()};
  for (let i of reset_list) {
    p.resets[i] = 0;
  }
  return p;
}

let tick = function () {
  let new_time = new Date().getTime();
  let tick_length = (new_time - player.time) / 1000;
  player.x = player.x.plus(prod(
    player.x, player.val_5, player.resets).times(tick_length));
  if (get_val_5_exists()) {
    player.val_5 = player.val_5.plus(val_5_prod(
      player.x, player.val_5, player.resets).times(tick_length));
  }
  player.time = new_time;
  update_display();
}

let update_display = function () {
  document.getElementById('x').innerHTML = 'Points: ' + player.x.toStr(2);
  document.getElementById('prod').innerHTML = 'Points per second: ' +
  prod(player.x, player.val_5, player.resets).toStr(2);
  if (get_val_5_exists()) {
    document.getElementById('val_5').innerHTML = 'Mini points: ' +
    player.val_5.toStr(2);
    document.getElementById('val_5_prod').innerHTML = 'Mini points per second: ' +
    val_5_prod(player.x, player.val_5, player.resets).toStr(2);
  } else {
    document.getElementById('val_5').innerHTML = '';
    document.getElementById('val_5_prod').innerHTML = '';
  }
  for (let i of reset_list) {
    set_reset_text(player.x, player.val_5, player.resets, i);
  }
}

let setup = function () {
  for (let i of reset_list) {
    document.getElementById(i).onclick = function () {
      try_to_reset(i);
    }
  }
  document.getElementById('import').onclick = import_save;
  document.getElementById('export').onclick = export_save;
}

let make_save = function () {
  let save = {'x': player.x.save(), 'val_5': player.val_5.save(),
  'resets': player.resets, 'time': player.time};
  localStorage.setItem('reset_save', JSON.stringify(save));
}

let load_save = function () {
  let save = JSON.parse(localStorage.getItem('reset_save'));
  if (save) {
    player = {'x': new Decimal(save.x, true), 'val_5': new Decimal(save.val_5, true),
    'resets': save.resets, 'time': save.time};
  }
}

let export_save = function () {
  make_save();
  document.getElementById('save-area').value = localStorage.getItem('reset_save');
}

let import_save = function () {
  localStorage.setItem('reset_save', document.getElementById('save-area').value);
  load_save();
}

let player = init_player();

load_save();

setup();

setInterval(tick, 100);

setInterval(make_save, 2000);
