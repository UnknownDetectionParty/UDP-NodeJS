module.exports = (java) => {
    var module = {};
    var Minecraft = java.import('bhz');

    module.getMinecraft = () => {
        return Minecraft.zSync();
    };

    module.getWorld = () => {
        return module.getMinecraft() ? module.getMinecraft().f : null;
    }

    module.getPlayer = () => {
        return module.getMinecraft() ? module.getMinecraft().h : null;
    };

    return module;
};