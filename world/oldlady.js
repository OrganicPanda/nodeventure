var startChatToOldlady = function(player, game) {

  player.write('Oldlady says: Hello dearie, I\'m so upset because my daughter here has died.');
  player.write('The Old Lady shows you a beaten up looking doll with a missing eye.');
  player.write('Oldlady says: I wonder if you can find me a glass eye and some thread so I can put her eye back. I think we have a chance to bring her back to life.');

  return {
    'yes' : ['Yes I will help', playerAccepts],
    'no' : ['Sorry but no', playerDeclines]
  };

};

var playerAccepts = function(player, game) {

  player.write('Oldlady says: Thank you'); 

};

var playerDeclines = function(player, game) {

  player.write('Oldlady says: How rude'); 

};

var oldlady = character('oldlady', {
  location: 'dollhouse',
  description: 'An old lady. She seems strangely interested in one of the dolls in particular.',
  onReceive: function(player, item) {
    player.write(item.name);
  },
  talk: startChatToOldlady
});

handler('tick', function () {
  // every 20 seconds on average
  if (Math.random() * 40 < 1) {
    oldlady.execute('say Oh my poor poor dear');
  }  
});
