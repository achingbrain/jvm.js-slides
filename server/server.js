/* http://docs.meteor.com/#publishandsubscribe
 * These functions control how Meteor servers publish sets of records and how clients can subscribe to those sets.
 */
Meteor.publish("allplayers", function(){
	return Players.find();
});

// Bring oot yer dead.
Meteor.setInterval(function(){
	var timestamp = now();

	Players.remove({ lastActive: { $lt: timestamp - deadAfter } }, function(err){
		if(err){
			console.warn(err);
		}
	});
}, 5000);

/* http://docs.meteor.com/#methods_header
 * Methods are remote functions that Meteor clients can invoke.
 *
 * These methods can be remotely executed from the client via: 
 *   - Method.call('someMethod', arg1, argN, function callback(result){})
 *   - Method.apply('someMethod', [a1, aN], function callback(result){})
 */
Meteor.methods({
	killEmAll: function(){
		var total = Players.find().count();
		Players.remove({});
		return { killed: total };
	},

	ping: function(){
		return { serverTime: now() };
	},

	gotoSlide: function(which) {
		console.info('Updating all slides to', which);

		// Players.update({}, { $set: { gotoSlide: which }} );

		// TODO: Bad code. Try again.
		Players.find().forEach(function(player) {
			Players.update(player._id, { $set: { gotoSlide: undefined, gotoItem: undefined }} );
		});

		Players.find().forEach(function(player) {
			Players.update(player._id, { $set: { gotoSlide: which }} );
		});
	},

	gotoItem: function(which) {
		console.info('Updating all slides to', which);

		// Players.update({}, { $set: { gotoSlide: which }} );

		// TODO: Bad code. Try again.
		Players.find().forEach(function(player) {
			Players.update(player._id, { $set: { gotoSlide: undefined, gotoItem: undefined }} );
		});

		Players.find().forEach(function(player) {
			Players.update(player._id, { $set: { gotoItem: which }} );
		});
	},

	fin: function(){
		console.info('FIN!');

		var lastSlide = 30;

		// TODO: Bad code. Try again.
		Players.find().forEach(function(player) {
			Players.update(player._id, { $set: { gotoSlide: undefined }} );
		});

		Players.find().forEach(function(player) {
			Players.update(player._id, { $set: { gotoSlide: lastSlide }} );
		});
	}
});