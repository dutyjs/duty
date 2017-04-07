const ff = require('./index.js');

//ff.markcompleted({hash:'8f4343466'});
//ff.read('notcompleted');
//ff.read('date',{date:'4/7/2017'});

//ff.append({hash:'36ea387e1',text:' hello world'});

ff.read('date',{date: '4/7/2017',modifiedDate:'4/7/2017'});
//ff.read('date',{date: '4/7/2017'});
module.exports = ff;
