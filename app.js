const fs = require('fs');
const yggdrasil = require('yggdrasil')();
const promptSync = require('prompt-sync')();
const Util = require('./modules/util')();
const Client = require('./modules/Client');
const EventManager = require('./modules/EventManager');
const EventChatCommand = require('./modules/events/EventChatCommand');

var running = true;

var getShutdownThread = () => {
    var proxy = Util.getJvm().newProxy('java.lang.Runnable', {
        run: () => {
            console.log('Client shutting down');
            running = false;
        }
    });
    return Util.getJvm().newInstanceSync('java.lang.Thread', proxy);
};

async function startClient(auth) {
    var Runtime = Util.importClass('java.lang.Runtime');
    var System = Util.importClass('java.lang.System');
    var Main = Util.importClass('net.minecraft.client.main.Main');
    
    Runtime.getRuntimeSync().addShutdownHook(getShutdownThread());

    Main.main(Util.getJvm().newArray('java.lang.String', [
        '--username', auth.selectedProfile.name,
        '--version', 'udp',
        '--assetsDir', 'assets',
        '--assetIndex', Util.VERSION,
        '--uuid', auth.selectedProfile.id,
        '--accessToken', auth.accessToken,
        '--userType', 'legacy'
    ]));

    var aimbot = false;
    while (running) {
        var mc = Util.getJvm().callStaticMethodSync(Util.mapClass('net/minecraft/client/Minecraft'), Util.mapMethod('net/minecraft/client/Minecraft', 'getMinecraft', '()Lnet/minecraft/client/Minecraft;'));
        if (mc) {
            var currentScreen = mc[Util.mapField('net/minecraft/client/Minecraft', 'currentScreen')];
            if (currentScreen && Util.getJvm().instanceOf(currentScreen, Util.mapClass('net/minecraft/client/gui/GuiChat'))) {
                var inputField = Util.getPrivateFieldValue(currentScreen, Util.mapField('net/minecraft/client/gui/GuiChat', 'inputField'));
                if (inputField) {
                    var text = Util.getJvm().callMethodSync(inputField, Util.mapMethod('net/minecraft/client/gui/GuiTextField', 'getText', '()Ljava/lang/String;'));
                    if (text && text.startsWith('%%:') && text.endsWith(':%%')) {
                        var command = text.substring('%%:'.length, text.length - ':%%'.length)
                        Util.getJvm().callMethodSync(inputField, Util.mapMethod('net/minecraft/client/gui/GuiTextField', 'setText', '(Ljava/lang/String;)V'), '')

                        if (command == 'aimbot') {
                            aimbot = !aimbot;
                            var guiIngame = mc[Util.mapField('net/minecraft/client/Minecraft', 'ingameGUI')];
                            if (guiIngame) {
                                var chatGui = Util.getJvm().callMethodSync(guiIngame, Util.mapMethod('net/minecraft/client/gui/GuiIngame', 'getChatGUI', '()Lnet/minecraft/client/gui/GuiNewChat;'));
                                if (chatGui) {
                                    var component = Util.getJvm().newInstanceSync(Util.mapClass('net/minecraft/util/text/TextComponentString'), Util.replaceAll(`&eAimbot &d${aimbot ? 'Enabled' : 'Disabled'}`, '&', '\247'));
                                    Util.getJvm().callMethodSync(chatGui, Util.mapMethod('net/minecraft/client/gui/GuiNewChat', 'printChatMessage', '(Lnet/minecraft/util/text/ITextComponent;)V'), component);
                                }
                            }
                        }
                        EventManager.onEvent(new EventChatCommand(command));
                    }
                }
            }
            var player = mc[Util.mapField('net/minecraft/client/Minecraft', 'player')];
            if (player) {
                var playerPos = {
                    x: player[Util.mapField('net/minecraft/entity/Entity', 'posX')],
                    y: player[Util.mapField('net/minecraft/entity/Entity', 'posY')] + Util.getJvm().callMethodSync(player, Util.mapMethod('net/minecraft/entity/Entity', 'getEyeHeight', '()F')),
                    z: player[Util.mapField('net/minecraft/entity/Entity', 'posZ')]
                };
                if (aimbot) {
                    var world = mc[Util.mapField('net/minecraft/client/Minecraft', 'world')];
                    if (world) {
                        var entities = Util.getJvm().callMethodSync(world, Util.mapMethod('net/minecraft/world/World', 'getLoadedEntityList', '()Ljava/util/List;'));
                        if (entities) {
                            var dist = 6;
                            var closest = null;
                            entities.toArraySync().forEach((entity) => {
                                if (entity[Util.mapField('net/minecraft/entity/Entity', 'entityId')] != player[Util.mapField('net/minecraft/entity/Entity', 'entityId')] && Util.getJvm().instanceOf(entity, Util.mapClass('net/minecraft/entity/EntityLivingBase')) && Util.getJvm().callMethodSync(entity, Util.mapMethod('net/minecraft/entity/Entity', 'isEntityAlive', '()Z'))) {
                                    var entityPos = {
                                        x: entity[Util.mapField('net/minecraft/entity/Entity', 'posX')],
                                        y: entity[Util.mapField('net/minecraft/entity/Entity', 'posY')] + (entity[Util.mapField('net/minecraft/entity/Entity', 'height')] / 2.0),
                                        z: entity[Util.mapField('net/minecraft/entity/Entity', 'posZ')]
                                    };
                                    var newDist = Util.distanceXYZ(entityPos.x, entityPos.y, entityPos.z, playerPos.x, playerPos.y, playerPos.z);
                                    if (newDist < dist) {
                                        dist = newDist;
                                        closest = {
                                            entity: entity,
                                            x: entityPos.x,
                                            y: entityPos.y,
                                            z: entityPos.z
                                        };
                                    }
                                }
                            });
                            if (closest) {
                                var rotation = Util.directionXYZ(playerPos.x, playerPos.y, playerPos.z, closest.x, closest.y, closest.z);
                                player[Util.mapField('net/minecraft/entity/Entity', 'rotationYaw')] = Util.getJvm().newFloat(rotation[0]);
                                player[Util.mapField('net/minecraft/entity/Entity', 'rotationPitch')] = Util.getJvm().newFloat(rotation[1]);
                            }
                        }
                    }
                }
            }
        }
        await Util.sleep(1000 / 60);
    }
};

var launch = () => {
    Util.setupJVM();

    var client = new Client();
    
    if (!fs.existsSync(Util.ABSOLUTE)) {
        console.log('Minecraft cannot be found');
        return;
    }
    process.chdir(Util.ABSOLUTE);

    //get auth token
    yggdrasil.auth({
        user: promptSync('Username / Email: '),
        pass: promptSync('Password: ')
    }, (err, res) => {
        if (err)
            console.log(err);
        else if (res && res.selectedProfile)
            startClient(res);
    });
};

launch();