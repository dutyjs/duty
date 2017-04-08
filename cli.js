const ff = require('./index.js');

//ff.markcompleted({hash:'8f4343466'});
//ff.read('notcompleted');
//ff.read('date',{date:'4/7/2017'});

//ff.append({hash:'261d9674a',text:' hello world'});

//ff.read('date',{date: '4/7/2017',modifiedDate:'4/8/2017'});
//ff.read('date',{date: '4/7/2017'});
const hash = "0ba0cb33c";
//ff.urgency({hash, urgency:'urgency:later'});
//ff.urgency({hash, urgency:'urgency:pending'});
//ff.add('I need to drink some water');

//ff.read('urgency:pending');
//ff.deleteByHash({hash:"d26a5d063d23c4896b1d12640466fc25c9ac359abddec67768311908e84d1a41"});

//ff.add({todo: 'victory is', category: 'adf'});

//ff.read('date', {date: '4/7/2017'});

//ff.categorize({hash,category: ['testing','test','wetest','church']});
//ff.read('category:testing');
//ff.delete('all');

//ff.add({todo:'hello world'});
//ff.add({todo:'i am a good boy',category:['good_boy']});

//ff.delete('hash',{hash:'b94d27b99'});
//ff.add({todo:'i need to eat bacon', category: ['food','meat']});
//ff.markcompleted({hash:"544bca29b"});
ff.delete('completed');
module.exports = ff;
