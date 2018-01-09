const fs = require('fs');
const java = require('java');

var dependencies = fs.readdirSync('./lib');

java.options.push(`-Djava.library.path=native`);

dependencies.forEach((dependency) => java.classpath.push(`./lib/${dependency}`));

const MathHelper = require('./modules/mathhelper')();
const Helper = require('./modules/helper')(java);
const Util = require('./modules/util')();

const System = java.import('java.lang.System');
const Main = java.import('net.minecraft.client.main.Main');

Main.main(java.newArray('java.lang.String', ['--version', 'nodejs', '--accessToken', '0', '--assetsDir', 'assets', '--assetIndex', '1.12', '--userProperties', '{}']));

async function run() {
	while (true) {
		var world = Helper.getWorld();
		var player = Helper.getPlayer();

		if (world && player) {
			var entityList = world.LSync();

			var dist = 6;
			var closest = null;

			if (entityList) {
				entityList.toArraySync().forEach((entity) => {
					if (entity.SSync() != player.SSync() && java.instanceOf(entity, 'vn')) {
						var newDist = MathHelper.distance3(entity.p, entity.q, entity.r, player.p, player.q, player.r);
						if (newDist < dist) {
							dist = newDist;
							closest = entity;
						}
					}
				});
			}

			if (closest) {
				var rotation = MathHelper.direction3(player.p, player.q, player.r, closest.p, closest.q, closest.r);
				player.v = java.newFloat(rotation[0]);
				player.w = java.newFloat(rotation[1]);
			}
		}

		/*if (player)
			player.v = java.newFloat(player.v + 10);*/

		await Util.sleep(1000 / 60);
	}
}

run();
