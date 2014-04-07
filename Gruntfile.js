module.exports = function ( grunt ) {
  var pkg = require('./package.json'),  
    fs = require('fs');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodewebkit: {
      options: {
        build_dir: './builds', 
        linux64: true,
        app_name : "Pastila",
        app_version : "<% pkg.version %>"
      },
      src: ['./app/**/*'] 
    },
    watch: {
      styles: {
        files: ['assets/stylus/**/*.styl'],
        tasks: ['stylus']
      },
      pkg : {
        files : ['./package.json'],
        task : ['syncPackage']
      }
    },
    stylus: {
      compile: {
        options: {
          paths: ['assets/stylus/ui', 'assets/stylus'],
          urlfunc: 'embedurl', // use embedurl('test.png') in our code to trigger Data URI embedding
          use: [
            require('nib') // use stylus plugin at compile time
          ]
        },
        files: {
          'app/css/main.css': 'assets/stylus/main.styl', // 1:1 compile
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('syncPackage', function ( ) {
    var appPkg = require('./app/package.json'),
        update;
    if( pkg.version !== appPkg.version ) {
      update = true;
      appPkg.version = pkg.version;
    }

    if( pkg.name !== appPkg.name ) {
      update = true;
      appPkg.name = pkg.name;
    }

    if ( update ) {
      console.log('Updating app/package.json');
      fs.writeFileSync('./app/package.json', JSON.stringify(appPkg, null, '\t'));
    }
  });

  grunt.registerTask('default', ['stylus', 'syncPackage', 'watch']);
};
