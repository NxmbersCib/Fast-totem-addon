import { world, Player } from '@minecraft/server';

world.events.beforeItemUse.subscribe(async (arg) => {
    if (!arg.source instanceof Player || arg.item.typeId != 'minecraft:totem_of_undying') { return; };
    let player = arg.source;
    player.runCommandAsync(`testfor @s[hasitem=[{location=slot.weapon.mainhand,item=totem_of_undying,quantity=1},{location=slot.weapon.offhand,item=totem_of_undying,quantity=1}]]`).then(() => {
      //console.warn('Cant swap')
    }).catch(() => {
      swap(player);
    });
});
function swap(player) {
    player.runCommandAsync(`replaceitem entity @s[hasitem=[{location=slot.weapon.mainhand,item=totem_of_undying,quantity=1},{location=slot.weapon.offhand,item=totem_of_undying,quantity=0}]] slot.weapon.offhand 0 keep totem_of_undying`);
    player.runCommandAsync(`execute as @s[hasitem=[{location=slot.weapon.mainhand,item=totem_of_undying,quantity=1},{location=slot.weapon.offhand,item=totem_of_undying,quantity=1}]] run replaceitem entity @s[hasitem=[{location=slot.weapon.mainhand,item=totem_of_undying,quantity=1},{location=slot.weapon.offhand,item=totem_of_undying,quantity=1}]] slot.weapon.mainhand 0 air`);
    player.runCommandAsync(`playsound armor.equip_generic @s[hasitem=[{location=slot.weapon.offhand,item=totem_of_undying,quantity=1},{location=slot.weapon.mainhand,item=totem_of_undying,quantity=0}]]`);
};