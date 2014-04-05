module.exports = function ( grunt ) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodewebkit: {
      options: {
        build_dir: './builds', 
        linux64: true,
        app_name : "Gist About",
        app_version : "<% pkg.version %>"
      },
      src: ['./app/**/*'] 
    }
  });

  grunt.loadNpmTasks('grunt-node-webkit-builder');
};
