const LORE_LIST = [
  'You just got a game idea and you\'re excited to start working on it with a few other people. It seems simple enough that it should only take 5 hours to finish.',
  'You started working. Everything seems fairly reasonable so far.',
  'Weird, you\'ve only made two minutes of progress on what you\'re working on, but you think it\'s been a bit longer than that.',
  'The oddly-slow progress thing is still happening. Is time itself bending? Probably not: it\'s just that you had unrealistic expectations. You hope this doesn\'t get worse.',
  'You manage to recruit another developer to help. They seem to be just as effective as you and the people you were already working with.',
  'Your study of efficiency is paying off. You\'re now 20% more effective at getting stuff done, and it\'s only getting better.',
  'It seems that most of the unexpected slowdown in progress is due to bad coding style, and by refactoring the code you\'ve managed to significantly improve the ease of progress.',
  'The efficiency and refactoring weren\'t enough. You decided to restart the project from scratch, taking advantage of what you\'d learned.',
  'Progress seems to be slowing down, even given everything you\'ve learned from restarting the project. Perhaps you need more patience, though.',
  'Patience alone didn\'t seem to help quite enough to finish; you\'re close, but not there. Maybe there\'s something you can do to enlighten the situation.',
  'You\'re now enlightened. Apart from the mystical aspects, this seems to make patience a little stronger. You feel that restarting the project will cause you to lose your enlightenment, though.',
  'You finally made a game which was basically what you wanted, but you\'ve thought of a bunch of cool stuff you can add. Maybe you can release another update with that.',
  'You\'ve gotten enough experience from past updates that now you can make bigger updates. How far will this go?',
  'You seem to be getting the hang of this. It\'s a bit monotonous, but maybe that will change soon. Maybe at 24:00:00, that seems significant.',
  'You decide that for some update soon, you\'re going to start programming in a new language. All your skills in it are terrible, but you\'ve heard that the new paradigm might give you enlightenment, so you try it anyway.',
  'One of the people working with you tells you that efficiency is overrated. You decide that you\'ll try not working on it while making some update soon.',
  'OK, efficiency is more useful than you thought. In that case, as suggested by someone else, refactoring must be what\'s overrated. You decide to try going without that.',
  'Going without efficiency and without refactoring turned out to both be terrible ideas. You decide that to avoid such bad ideas from other people, you\'ll just work alone.',
  'This is all so slow! You decide that you\'re going to stop waiting for patience. You have a bunch of enlightenment even without patience, so what\'s the point of patience anyway?',
  'Restarting development over and over without even releasing an update is so annoying! You decide to try to release an update without starting over for once.',
  'You\'re planning on taking a vacation, along with everyone else. You all won\'t be able to dedicate quite as much time to updating the game then, but it will still be fine, right?',
  'What was the use of experience anyway? It\'s said that it gives you some kind of "power", but that power doesn\'t seem that powerful. You\'ll just go without it.',
  'There\'s some other stuff you did with your experience, but in retrospect it couldn\'t have been worth it. You decide to do without that instead.',
  'Wow, you understand that other language now. That wasn\'t too bad.',
  'Maybe you spoke too soon. You\'ve kept programming in that other language and now you\'re getting some "dilation", whatever that is. Even though it\'s right in front of you, it seems hard to describe to anyone else.',
  'You still don\'t really know what this "dilation" stuff is, but it seems useful. You think you probably have enough of it for now, though.',
  'You are extremely enlightened right now, but it doesn\'t actually seem to be helping in development that much.',
  'There are a lot of people working on this game. You decide to not think about whether anyone is actually playing it.',
  'Well, you\'ve done it. You\'ve made so many great updates that your game is recognized as the best game in the world. You still feel like you could add more to it, but you\'re not sure what the point would be.',
  'Not only is your game the best ever, but you\'ve done everything that could be expected of you in its development, even some things that were considered unrelated (e.g., that "dilation" was apparently an important new substance in physics). You\'re not really sure what to do next.',
  'You feel something in your mind saying "Yeah, that\'s it, you\'ve basically reached the end of the game\'s content." You\'re not sure what that means; you still have more ideas for your game. "You can either keep going (some new stuff happens, but who cares that much?) or hard reset." Huh? "In any case, congratulations, thanks for playing, and I hope you enjoyed."',
  'Not that long later, you meet someone who looks surprised to see you. She says she just finished your game and wonders what she can do next. You say, "Well of course you can keep going or hard reset" (and you suddenly understand the voice in your mind a bit better) "but you can also make your own game. Maybe it will catch on."',
  'As you say this, you remember how far you\'ve gone in your quest to make a game, and how far you\'ve come since you\'ve started. You also recall how, in playing, the person you\'re talking to must have gone through a similar journey. You hear the voice in your mind say "So did I" [not really, making this game was rather easy, but please ignore this bracketed part OK?], and you smile.'
];

function updateLoreDisplay() {
  let loreShown = LORE_LIST.map((lore, i) => (player.lore.indexOf(i) === -1) ? '' : lore);
  while (loreShown[loreShown.length - 1] === '') {
    loreShown.pop();
  }
  document.getElementById('lore-div').innerHTML = loreShown.join('<br/>') + '<hr/>';
}
