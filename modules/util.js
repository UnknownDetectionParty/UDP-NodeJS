const fs = require('fs');
const appdata = require('appdata-path');
const java = require('java');
const Zip = require('adm-zip');

module.exports = () => {
    var module = {};
    var mapping = {};
    var classes = {};

    module.ABSOLUTE = `${appdata.getAppDataPath()}/.minecraft`;
    module.VERSION = '1.13';
    module.LIB_DIR = 'libraries';
    module.VER_DIR = `versions/${module.VERSION}`;
    module.NAT_DIR = `${module.VER_DIR}/${module.VERSION}-natives`;
    module.MAP_FILE = `./mappings/${module.VERSION}.json`;

    module.LIB_DIR_INC = `lib/${module.VERSION}`;

    module.getAbsolute = (dir) => {
        return `${module.ABSOLUTE}/${dir}`;
    };

    module.setupJVM = () => {
        if (fs.existsSync(module.MAP_FILE))
            mapping = JSON.parse(fs.readFileSync(module.MAP_FILE));

        java.options.push(`-Djava.library.path=${module.NAT_DIR}`);
        java.classpath.push(`${module.getAbsolute(module.VER_DIR)}/${module.VERSION}.jar`);

        var json = JSON.parse(fs.readFileSync(`${module.getAbsolute(module.VER_DIR)}/${module.VERSION}.json`));
        if (json.libraries)
            json.libraries.forEach((lib) => {
                if (lib) {
                    if (lib.downloads && lib.downloads.artifact && lib.downloads.artifact.path)
                        if (fs.existsSync(`${module.getAbsolute(module.LIB_DIR)}/${lib.downloads.artifact.path}`))
                            java.classpath.push(`${module.getAbsolute(module.LIB_DIR)}/${lib.downloads.artifact.path}`);
                    if (lib.natives) {
                        var natives = [lib.natives.linux, lib.natives.osx, lib.natives.windows];
                        natives.forEach((native) => {
                            if (native && lib.downloads && lib.downloads.classifiers && lib.downloads.classifiers[native] && lib.downloads.classifiers[native].path && fs.existsSync(`${module.getAbsolute(module.LIB_DIR)}/${lib.downloads.classifiers[native].path}`))
                                new Zip(`${module.getAbsolute(module.LIB_DIR)}/${lib.downloads.classifiers[native].path}`).extractAllTo(`${module.getAbsolute(module.NAT_DIR)}`, true);
                        });
                    }
                }
            });

        if (fs.existsSync(module.LIB_DIR_INC))
            java.classpath.pushDir(module.LIB_DIR_INC);
    };

    module.getJvm = () => {
        return java;
    };

    module.importClass = (cls) => {
        if (classes[cls])
            return classes[cls];
        return classes[cls] = java.import(module.mapClass(cls));
    };

    module.mapClass = (cls) => {
        var _cls = mapping[cls];
        return _cls ? mapping[cls].obf : cls;
    };

    module.mapField = (cls, fld) => {
        var _cls = mapping[cls];
        return _cls ? _cls.fields[`${fld}`] : fld;
    };

    module.mapMethod = (cls, mtd, sig) => {
        var _cls = mapping[cls];
        return _cls ? _cls.methods[`${mtd}:${sig}`] + module.convertSig(sig) : mtd;
    };

    module.mapMethodName = (cls, mtd, sig) => {
        var _cls = mapping[cls];
        return _cls ? _cls.methods[`${mtd}:${sig}`] : mtd;
    }

    module.getPrivateFieldValue = (obj, fld) => {
        if (!obj || !fld) {
            console.log(`Failed to get private field ${fld} value for ${obj}`);
            return null;
        }
        return obj.getClassSync().getDeclaredFieldSync(fld).getSync(obj);
    };

    module.convertSig = (sig) => {
        for (var key in mapping)
            sig = module.replaceAll(sig, `L${key};`, `L${module.mapClass(key)};`);
        return sig;
    };

    module.replaceAll = (input, search, replace) => {
        return input.split(search).join(replace);
    };

    module.sleep = (ms) => {
        return new Promise(r => setTimeout(r, ms));
    };

    module.radtodeg = (x) => {
        return x * 180.0 / Math.PI;
    };

    module.distanceXY = (x, y) => {
        return Math.hypot(x, y);
    };

    module.distanceXYZ = (x1, y1, z1, x2, y2, z2) => {
        return module.distanceXY(y1 - y2, module.distanceXY(x1 - x2, z1 - z2));
    };

    module.directionXY = (x1, y1, x2, y2) => {
        return module.radtodeg(Math.atan2(y2 - y1, x2 - y1));
    };

    module.directionXYZ = (x1, y1, z1, x2, y2, z2) => {
        var dx = x2 - x1;
        var dy = y2 - y1;
        var dz = z2 - z1;
        var yaw = module.radtodeg(Math.atan2(dz, dx)) - 90;
        var pitch = -module.radtodeg(Math.atan2(dy, module.distanceXY(dx, dz)));
        return [yaw, pitch];
    };

    return module;
};