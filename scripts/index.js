// Este archivo fue escrito por nxmberscib (Discord & twitter), cualquier uso, modificación o intento de lucro sin autorización del mismo sera penalizado.
// This file was written by nxmberscib (Discord & twitter), any use, modification or profit intent whitout their autorization will be penalized.
import {
  world,
  EquipmentSlot,
  system,
  DynamicPropertiesDefinition,
} from "@minecraft/server";
const defaultValues = {
  alert: "§6§l{name}§r§6 has used a totem.",
  achievementMsg: "{name} reached the goal §a[Postmortal]",
  achievement: true
}
world.afterEvents.worldInitialize.subscribe((arg) => {
  const optionsDef = new DynamicPropertiesDefinition();
  optionsDef.defineString("alert", 256, "§6§l{name}§r§6 has used a totem.");
  optionsDef.defineBoolean("alertShow", true);
  optionsDef.defineString("achievementMsg", 256, "{name} reached the goal §a[Postmortal]");
  optionsDef.defineBoolean("achievementShow", true);
})
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
world.beforeEvents.chatSend.subscribe(async (argument) => {
  const arg = argument;
  await null;
  const command = arg.message.match(/(!).*?(?=\s)/)?.[0];
  if (!command) {
    return;
  }
  const parameters = arg.message
    .replace(command, "")
    .match(/@"((?:[^"\\]|\\.)+)"|((?:@[^\s]+)|(?:[^"\s]+))|"([^"]+)"|{(?:[^"\s]+)/g);
  switch (command.substring(1)) {
    case "alert": {
      switch (parameters[0]) {
        case "set": {
          world.setDynamicProperty("alert", parameters?.[1]);
          arg.sender.sendMessage(`Totem alert message is now: ${parameters?.[1]}.`);
        } break;
        case "reset": {
          world.setDynamicProperty("alert", defaultValues.alert);
          arg.sender.sendMessage("Totem alert message was reset to its default value.");
        } break;
        case "show": {
          const newValue = Boolean(parameters?.[1]);
          if (!newValue) {
            arg.sender.sendMessage("You must specify a new boolean (true/false) value");
          };
          world.setDynamicProperty("alertShow", newValue);
        } break;
        default: { }
      }
    } break;
    case "achievement": {
      switch (parameters[0]) {
        case "set": {
          world.setDynamicProperty("achievement", parameters?.[1]);
          arg.sender.sendMessage(`Totem postmortal achievement message is now: ${parameters?.[1]}.`);
        } break;
        case "reset": {
          world.setDynamicProperty("achievement", defaultValues.alert);
          arg.sender.sendMessage("Totem postmortal achievement  message was reset to its default value.");
        } break;
        case "show": {
          const newValue = Boolean(parameters?.[1]);
          if (!newValue) {
            arg.sender.sendMessage("You must specify a new boolean (true/false) value");
          };
          world.setDynamicProperty("achievementShow", newValue);
        } break;
        default: { }
      }
    } break;
    default: {
      player.sendMessage({
        rawtext: [{ text: "§c" }, { translate: "commands.generic.unknown", with: [command.substring(1)] }],
      });
    };
  }
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
