// Este archivo fue escrito por CibNumeritos#1094, cualquier uso, modificación o intento de lucro sin autorización del mismo sera penalizado. 
// This file was written by CibNumeritos#1094, any use, modification or profit intent whitout their autorization will be penalized. 
import { world, EquipmentSlot, system } from '@minecraft/server';
const alertColor = '§6'; // Change this to the color you want for the totem alert message
world.events.beforeItemUse.subscribe((arg) => {
    const { item, source } = arg;
    if ((item.typeId != 'minecraft:totem_of_undying' && item.typeId != 'minecraft:shield')) {
        return;
    };
    const offhand = source.getComponent('minecraft:equipment_inventory');
    const offhandItem = offhand.getEquipment(EquipmentSlot.offhand);
    const container = source.getComponent('minecraft:inventory').container;
    const mainhand = container.getSlot(source.selectedSlot);
    const mainhandItem = container.getItem(source.selectedSlot);
    offhand.setEquipment(EquipmentSlot.offhand, mainhandItem);
    source.playSound('armor.equip_generic');
    mainhand.setItem(offhandItem);
});
world.events.entityHurt.subscribe((arg) => {
    const { hurtEntity, damage } = arg;
    const health = hurtEntity.getComponent('minecraft:health')
    if (health.current <= 0) {
        system.runTimeout(() => {
            if (health.current > 0) {
                hurtEntity.runCommandAsync(`damage @s 0 none`);
            };
        }, 1);
    };
    if (damage > 0) {
        return;
    };
    if (!hurtEntity.hasTag('ReachedPostmortal')) {
        world.sendMessage({ "rawtext": [{ "text": `${hurtEntity.name} reached the goal §a[Postmortal]` }] });
        hurtEntity.addTag('ReachedPostmortal');
    };
    world.sendMessage({ "rawtext": [{ "text": `${alertColor}§l${hurtEntity.name}§r${alertColor} has used a totem.` }] });
    for (const player of world.getPlayers({ "excludeNames": [hurtEntity.name] })) {
        player.playSound('random.totem');
    };
}, { "entityTypes": ["minecraft:player"] });
