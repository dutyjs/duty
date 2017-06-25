const gulp = require("gulp");
const { exec } = require("child_process");


gulp.task("run_npm_test", () => {
    exec("npm test", ( err , data ) => {
        if ( err )
            return console.log(err);
        return console.log(data);
    });
});

gulp.task("run_coverage", () => {
    exec("npm run coverage", ( err, data ) => {
        if ( err )
            return console.error(err);
       return console.log(data);
    });
});

gulp.task("watch", () => {
    gulp.watch(["test/general_test.js", "cli.js", "src/*.js"],["run_npm_test","run_coverage"]);
});

gulp.task("default", ["run_npm_test","run_coverage","watch"]);
