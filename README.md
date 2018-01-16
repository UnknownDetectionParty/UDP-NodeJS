# Unknown Detection Party
### A Minecraft Cheat in NodeJS

![](https://i.imgur.com/LhpA6Kl.png)

Nothing big, just a small intro for (s)kids wanting to make NodeJS clients (and no, this doesn't involve any Java code)

The code is a mess, mainly cause it's more of a POC to myself more than anything. I'll probably clean it up over the next few weeks, but don't hold me to that, cause there's a 50% chance it won't happen.

Happy skidding!

### Requirements

  - Python 2.x (! Not 3.x !)
  - NodeJS and NPM
  - JDK
  - Minecraft 1.12 or 1.11 (Current mappings are for 1.11-1.12) (Or provide mappings in the correct format for other versions)
  - Node Packages: `fs`, `java`, `appdata-path`, `adm-zip`

### Getting Started

  - If you haven't already, install NodeJS, NPM, and Python 2.x
  - Create a new directory for the project
  - Open a terminal in the root of your project (cmd, bash, whatever)
  - Run `npm install fs`
  - Run `npm install java`
  - Run `npm install appdata-path`
  - Run `npm install adm-zip`
  - Create a new file called `app.js`, this will be the main file, and put the following inside:
    ```js
    //Import the required libraries
    const fs = require('fs');
    const Util = require('./modules/util')();
    
    //To know when to shut down
    var running = true;
    
    //Create a new thread for when the jvm is shutting down
    var getShutdownThread = () => {
        var proxy = Util.getJvm().newProxy('java.lang.Runnable', { run: () => { running = false; } });
        return Util.getJvm().newInstanceSync('java.lang.Thread', proxy);
    };
    
    //Start Minecraft
    var startClient = () => {
        //Import the Runtime and Main classes
        var Runtime = Util.importClass('java.lang.Runtime');
        var Main = Util.importClass('net.minecraft.client.main.Main');
        
        //Add to the jvm shutdown hook
        Runtime.getRuntimeSync().addShutdownHook(getShutdownThread());
        
        //Launch Minecraft
        Main.main(Util.getJvm().newArray('java.lang.String', ['--version', 'udp', '--accessToken', '0', '--assetsDir', 'assets', '--assetIndex', Util.VERSION, '--userProperties', '{}']));
    };
    
    //Initialization
    var launch = () => {
        //Sets up jvm options + classpath
        Util.setupJVM();
        
        //Makes sure you have Minecraft installed (.minecraft)
        if (!fs.existsSync(Util.ABSOLUTE))
            return;
        
        //Set the working dir to '.minecraft'
        process.chdir(Util.ABSOLUTE);
        
        startClient();
    };
    
    launch();
    ```
  - Create a new directory called `modules`
  - Create a new file in the `modules` directory called `util.js`, and put the following inside:
    ```js
    const fs = require('fs');
    const appdata = require('appdata-path');
    const java = require('java');
    const Zip = require('adm-zip');
    
    module.exports = () => {
        var module = {};
        
        module.ABSOLUTE = `${appdata.getAppDataPath()}/.minecraft`;
        module.VERSION = '1.12';
        module.LIB_DIR = 'libraries';
        module.VER_DIR = `versions/${module.VERSION}`;
        module.NAT_DIR = `${module.VER_DIR}/${module.VERSION}-natives`;
        module.MAP_FILE = `./mappings/${module.VERSION}.json`;
        
        module.getAbsolute = (dir) => {
            return `${module.ABSOLUTE}/${dir}`;
        };
        
        module.setupJVM = () => {
            if (fs.existsSync(module.MAP_FILE))
                mapping = JSON.parse(fs.readFileSync(module.MAP_FILE));
    
            java.options.push(`-Djava.library.path=${module.NAT_DIR}`);
            java.classpath.push(`${module.getAbsolute(module.VER_DIR)}/${module.VERSION}.jar`);
    
            var json = JSON.parse(fs.readFileSync(`${module.getAbsolute(module.VER_DIR)}/${module.VERSION}.json`))
            if (json.libraries)
                json.libraries.forEach((lib) => {
                    if (lib) {
                        if (lib.downloads && lib.downloads.artifact && lib.downloads.artifact.path)
                            if (fs.existsSync(`${module.getAbsolute(module.LIB_DIR)}/${lib.downloads.artifact.path}`))
                                java.classpath.push(`${module.getAbsolute(module.LIB_DIR)}/${lib.downloads.artifact.path}`);
                        if (lib.extract && lib.natives) {
                            var natives = [lib.natives.linux, lib.natives.osx, lib.natives.windows];
                            natives.forEach((native) => {
                                if (native && lib.downloads && lib.downloads.classifiers && lib.downloads.classifiers[native] && lib.downloads.classifiers[native].path && fs.existsSync(`${module.getAbsolute(module.LIB_DIR)}/${lib.downloads.classifiers[native].path}`))
                                    new Zip(`${module.getAbsolute(module.LIB_DIR)}/${lib.downloads.classifiers[native].path}`).extractAllTo(`${module.getAbsolute(module.NAT_DIR)}`, true);
                            });
                        }
                    }
                });
        };
    
        module.getJvm = () => {
            return java;
        };
    
        module.importClass = (cls) => {
            if (classes[cls])
                return classes[cls];
            return classes[cls] = java.import(module.mapClass(cls));
        };
        
        return module;
    }
    ```

After following the above, open a terminal in the directory of your `app.js` or whatever you desired to call it, and run `node app`, and watch the magic unfold!

### Disclaimer

This does not currently allow you to log in with your Minecraft account, so for now it is just a proof of concept, but will eventually be more. It also doesn't run off your current install of Minecraft (it only requires specific files), so if you're wanting your saves, options, texturepacks, multiplayer stuff, then copy that over to your projects root directory