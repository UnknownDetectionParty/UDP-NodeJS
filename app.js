const fs = require('fs');
const java = require('java');

const Util = require('./modules/util')(java);

var running = true;

var getShutdownThread = () => {
    var proxy = java.newProxy('java.lang.Runnable', {
        run: () => {
            console.log('Client shutting down');
            running = false;
        }
    });
    return java.newInstanceSync('java.lang.Thread', proxy);
};

async function startClient() {
    var Runtime = Util.importClass('java.lang.Runtime');
    var System = Util.importClass('java.lang.System');
    var Main = Util.importClass('net.minecraft.client.main.Main');
    
    Runtime.getRuntimeSync().addShutdownHook(getShutdownThread());
    Main.main(java.newArray('java.lang.String', ['--version', 'udp', '--accessToken', '0', '--assetsDir', 'assets', '--assetIndex', '1.12', '--userProperties', '{}']));

    while (running) {
        var mc = java.callStaticMethodSync(
            Util.mapClass('net/minecraft/client/Minecraft'),
            Util.mapMethod(
                'net/minecraft/client/Minecraft',
                'getMinecraft',
                '()Lnet/minecraft/client/Minecraft;'
            )
        );
        if (mc) {
            var currentScreen = mc[Util.mapField(
                'net/minecraft/client/Minecraft',
                'currentScreen'
            )];
            if (currentScreen && java.instanceOf(currentScreen, Util.mapClass('net/minecraft/client/gui/GuiChat'))) {
                var inputField = Util.getPrivateFieldValue(currentScreen, Util.mapField(
                    'net/minecraft/client/gui/GuiChat',
                    'inputField'
                ));
                if (inputField) {
                    var text = java.callMethodSync(
                        inputField,
                        Util.mapMethod(
                            'net/minecraft/client/gui/GuiTextField',
                            'getText',
                            '()Ljava/lang/String;'
                        )
                    );
                    if (text && text.startsWith('%%:') && text.endsWith(':%%')) {
                        var command = text.substring('%%:'.length, text.length - ':%%'.length)
                        java.callMethodSync(
                            inputField,
                            Util.mapMethod('net/minecraft/client/gui/GuiTextField', 'setText', '(Ljava/lang/String;)V'),
                            ''
                        )
                        var guiIngame = mc[Util.mapField(
                            'net/minecraft/client/Minecraft',
                            'ingameGUI'
                        )];
                        if (guiIngame) {
                            var chatGui = java.callMethodSync(
                                guiIngame,
                                Util.mapMethod(
                                    'net/minecraft/client/gui/GuiIngame',
                                    'getChatGUI',
                                    '()Lnet/minecraft/client/gui/GuiNewChat;'
                                )
                            );
                            if (chatGui) {
                                var component = java.newInstanceSync(Util.mapClass('net/minecraft/util/text/TextComponentString'), Util.replaceAll(command, '&', '\247'));
                                java.callMethodSync(
                                    chatGui,
                                    Util.mapMethod(
                                        'net/minecraft/client/gui/GuiNewChat',
                                        'printChatMessage',
                                        '(Lnet/minecraft/util/text/ITextComponent;)V'
                                    ),
                                    component
                                );
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

    if (!fs.existsSync(Util.ABSOLUTE)) {
        console.log('Minecraft cannot be found');
        return;
    }
    process.chdir(Util.ABSOLUTE);

    startClient();
};

launch();