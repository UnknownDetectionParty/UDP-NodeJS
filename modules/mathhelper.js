module.exports = () => {
    var module = {};

    module.radtodeg = (x) => {
        return x * 180.0 / Math.PI;
    };

    module.distance2 = (x, y) => {
        return Math.hypot(x, y);
    };

    module.distance3 = (x1, y1, z1, x2, y2, z2) => {
        return module.distance2(y1 - y2, module.distance2(x1 - x2, z1 - z2));
    };

    module.direction2 = (x1, y1, x2, y2) => {
        return module.radtodeg(Math.atan2(y2 - y1, x2 - x1));
    };

    module.direction3 = (x1, y1, z1, x2, y2, z2) => {
        var dx = x2 - x1;
        var dy = y2 - y1;
        var dz = z2 - z1;
        var yaw = module.radtodeg(Math.atan2(dz, dx)) - 90;
        var pitch = -module.radtodeg(Math.atan2(dy, module.distance2(dx, dz)));
        return [yaw, pitch];
    };

    return module;
};