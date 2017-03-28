; ( function(ff,assert) {

    const hash = "asdasdfasdfasdf";
    const text = "asdfasf";
    assert.equal(ff.append({}), false, " if required argument is empty fail");
    assert.equal(ff.append({hash}), false, " if only hash is passed without text fail" );
    assert.equal(ff.append({text}), false, " if hash property is not given fail");
    assert.equal(ff.append({hash: "fdf",text}),false, " if the length of hash is lesser than 4 fail" );
    assert.equal(ff.append({hash,text}), false, "if hash is not found fail");
    assert.equal(ff.append({hash: "6df42afe8",text}),true, "should pass") ;
    assert.equal(ff.append({hash: "a27342862",text:"for sex"}),true,"should pass");

}(require('../cli.js'),
  require('assert')));
