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
  - Minecraft 1.12 (Current mappings are for 1.12)

### Getting Started

  - If you haven't already, install NodeJS, NPM, and Python 2.x
  - Create a new directory for the project
  - In the created directory, make 2 more called `lib` and `native`
  - Navigate to your Minecraft installation and then to the libraries (`./minecraft/libraries`), then search for `.jar`. Copy all the .jar files into your `lib` directory you created
  - Then navigate to the natives directory for the version you're making this for (`./minecraft/versions/1.12/1.12-natives`), copy all the files in that folder to the `native` directory you created
  - After copying all the libraries, navigate to the version you're making this for (`./minecraft/versions/1.12`), copy the version jar (`1.12.jar`) into your `lib` directory
  - If you're wanting sounds too, copy the `./minecraft/assets` folder to your root project directory too
  - Open a terminal in the root of your project (cmd, bash, whatever)
  - Run `npm install fs`
  - Run `npm install java`
  - Create a new file called `app.js`, this will be the main file, and put the following inside:
    ```js
    const fs = require('fs');
    const java = require('java');

    java.options.push('-Djava.library.path=native');

    var dependencies = fs.readdirSync('./lib');
    dependencies.forEach((dependency) => java.classpath.push(`./lib/${dependency}`));

    const Main = java.import('net.minecraft.client.main.Main');

    Main.main(java.newArray('java.lang.String', ['--version', 'nodejs', '--accessToken', '0', '--assetsDir', 'assets', '--assetIndex', '1.12', '--userProperties', '{}']));
    ```

After following the above, open a terminal in the directory of your `app.js` or whatever you desired to call it, and run `node app`, and watch the magic unfold!

### Disclaimer

This does not currently allow you to log in with your Minecraft account, so for now it is just a proof of concept, but will eventually be more. It also doesn't run off your current install of Minecraft (it only requires specific files), so if you're wanting your saves, options, texturepacks, multiplayer stuff, then copy that over to your projects root directory