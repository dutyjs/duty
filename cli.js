const ff = require('./index.js');

//ff.markcompleted({hash:'8f4343466'});
//ff.read('notcompleted');
//ff.read('date',{date:'4/7/2017'});

//ff.append({hash:'261d9674a',text:' hello world'});

//ff.read('date',{date: '4/7/2017',modifiedDate:'4/8/2017'});
//ff.read('date',{date: '4/7/2017'});
const hash = "d26a5d063";
//ff.urgency({hash, urgency:'urgency:later'});
//ff.urgency({hash, urgency:'urgency:pending'});
//ff.add('I need to drink some water');

ff.read('urgency:pending');

//ff.read('date', {date: '4/7/2017'});

module.exports = ff;
