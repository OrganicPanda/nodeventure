var playerTalkState = {};

command('talk', function (rest, player, game) {
	
	var command = rest.trim().split(' ');
	var target = game.getPlayer(command[0]);
	var reply = command[1];
	var conversationLevel;
	var replyResult;

	if (target) {

		// Can this character talk?
		if (typeof target.talk !== undefined) {
			
			// Is this a reply from the user?
			if (reply) {
			
				// Did their reply make sense?
				if (playerTalkState[player.name] && playerTalkState[player.name][reply]) {
					
					// So we run the function associated with that reply 
					replyResult = playerTalkState[player.name][reply][1](player, game);

					// The result should either be an object or falsy
					if (replyResult) {
						
						// Assumed object so make that our next level
						conversationLevel = replyResult;
					
					} else {
					
						// Falsy so we're done!
						delete playerTalkState[player.name];
						return;
						
					}
					
				} else {
					
					player.write('I don\'t understand');
					
				}
				
			} else {

				// No reply so start at the top level of conversation
				conversationLevel = target.talk(player, game);

			}
			
			// Intro
			player.write(target.name + ' says:');
			
			// List the options
			for (var key in conversationLevel) {
				
				player.write('> ' + key + ' : ' + conversationLevel[key][0]);
				
			}
			
			// Remember where we are for next time
			playerTalkState[player.name] = conversationLevel;
			
		}

	} else {

		player.write('Who are you talking to?');

	}
  
});