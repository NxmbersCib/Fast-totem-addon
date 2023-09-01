// Este archivo fue escrito por nxmberscib (Discord & twitter), cualquier uso, modificación o intento de lucro sin autorización del mismo sera penalizado.
// This file was written by nxmberscib (Discord & twitter), any use, modification or profit intent whitout their autorization will be penalized.
import {
  world,
  EquipmentSlot,
  system,
} from "@minecraft/server";
const alertColor = "§6"; // Change this to the color you want for the totem alert message.
world.beforeEvents.itemUse.subscribe((arg) => {
  const { itemStack, source } = arg;
  if (
    itemStack.typeId != "minecraft:totem_of_undying" &&
    itemStack.typeId != "minecraft:shield"
  ) {
    return;
  }
  system.run(() => {
    const offhand = source.getComponent("minecraft:equipment_inventory");
    const offhandItem = offhand.getEquipment(EquipmentSlot.offhand);
    const container = source.getComponent("minecraft:inventory").container;
    const mainhand = container.getSlot(source.selectedSlot);
    const mainhandItem = container.getItem(source.selectedSlot);
    offhand.setEquipment(EquipmentSlot.offhand, mainhandItem);
    source.playSound("armor.equip_generic");
    mainhand.setItem(offhandItem);
  });
});
world.afterEvents.entityHurt.subscribe(
  (arg) => {
    const { hurtEntity, damage, damageSource } = arg;
    if (damage > 0 || damageSource.cause != "none") {
      return;
    }
    if (!hurtEntity.hasTag("ReachedPostmortal")) {
      world.sendMessage({
        rawtext: [
          { text: `${hurtEntity.name} reached the goal §a[Postmortal]` },
        ],
      });
      hurtEntity.addTag("ReachedPostmortal");
    }
    world.sendMessage({
      rawtext: [
        {
          text: `${alertColor}§l${hurtEntity.name}§r${alertColor} has used a totem.`,
        },
      ],
    });
  },
  { entityTypes: ["minecraft:player"] }
);
