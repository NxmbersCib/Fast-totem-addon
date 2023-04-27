// Este archivo fue escrito por CibNumeritos#1094, cualquier uso, modificación o intento de lucro sin autorización del mismo sera penalizado. 
// This file was written by CibNumeritos#1094, any use, modification or profit intent whitout their autorization will be penalized. 
import{world,Player, EntityEquipmentInventoryComponent, EquipmentSlot, ItemStack, Container}from'@minecraft/server';
world.events.beforeItemUse.subscribe((arg)=>{
    if (!arg.source instanceof Player || (arg.item.typeId != 'minecraft:totem_of_undying' || arg.item.typeId != 'minecraft:shield')){
        return;
    };
    /**
     * @type {EntityEquipmentInventoryComponent}
     */
    const offhand = arg.player.getComponent('minecraft:equipment_inventory');
    /**
     * @type {Container}
     */
    const container = arg.player.getComponent('minecraft:inventory').container;
    const mainhand = container.getSlot(arg.player.selectedSlot);
    let offhandId = offhand?.getEquipmentSlot(EquipmentSlot.offhand)?.typeId;
    offhand.setEquipment(EquipmentSlot.offhand, mainhand.getItem());
    mainhand.setItem(offhand.getEquipment());
    // arg.source.runCommandAsync(`execute as @s unless entity @s[hasitem=[{location=slot.weapon.mainhand,item=totem_of_undying,quantity=1},{location=slot.weapon.offhand,item=totem_of_undying,quantity=1}]] run function swap_totem`);
});
