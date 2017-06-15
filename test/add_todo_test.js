/*  eslint-disable */


module.exports = (test_config2) => {

    describe("", () => {
        let add;
        
        beforeEach(() => {
            
            ({add} = new(require('../src/duty'))(test_config2));
        });        
        afterEach( () => {
            add = undefined;
        });

        it("should print out A todo content needs to be added if no todo was specifed", () => {
            
            expect(add({todo:undefined})).toEqual("A todo content needs to be added");
        });
    })

}

