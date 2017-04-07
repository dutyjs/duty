const ff = require('./index.js');

//ff.markcompleted({hash:'8f4343466'});
//ff.read('notcompleted');
//ff.read('date',{date:'4/7/2017'});

ff.append({hash:'8f4343466',text:' hello world'});
module.exports = ff;
