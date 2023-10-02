import {
  world,
  EquipmentSlot,
  system,
  DynamicPropertiesDefinition,
} from "@minecraft/server";
import { ActionFormData, FormCancelationReason, MessageFormData } from "@minecraft/server-ui";

const ConfigOption = {
  fast_totem: "FastTotem",
  fast_shield: "FastShield",
  postmortal_message: "Postmortal",
  achievement_message: "Achievement",
};

async function openForm(player, form, callback) {
  while (true) {
    const response = await form.show(player);
    if (response?.cancelationReason !== FormCancelationReason.UserBusy) {
      try {
        callback(response);
      } catch (error) {
        console.error("FORM ERROR", error, error.stack);
      }
      break;
    }
  }
}

function showMainForm(player) {
  const form = new ActionFormData();
  form.title("Player configuration");

  form.button(`Fast totem\n${player.hasTag("FastTotemEnabled") ? "§2Activated" : "§4Deactivated"}`, "textures/items/totem");
  form.button(`Fast shield\n${player.hasTag("FastShieldEnabled") ? "§2Activated" : "§4Deactivated"}`, "textures/ui/resistance_effect");
  form.button(`Totem alert\n${player.hasTag("PostmortalEnabled") ? "§2Activated" : "§4Deactivated"}`, "textures/items/map_filled");
  form.button(`Achievement alert\n${player.hasTag("AchievementEnabled") ? "§2Activated" : "§4Deactivated"}`, "textures/items/emerald");

  openForm(player, form, (response) => {
    if (response.canceled) {
      return;
    }
    const option = Object.keys(ConfigOption)[response.selection];
    configureOption(player, ConfigOption[option]);
  });
}

function configureOption(player, option) {
  const form = new MessageFormData()
    .body(`Do you want to activate or deactivate ${option}?`)
    .button1("§4Deactivate")
    .button2("§2Activate")
    .title(`Configure: ${option}`);
  openForm(player, form, (response) => {
    if (response.canceled) {
      return showMainForm(player);
    }
    //@ts-ignore
    const selection = response.selection == 0 ? false : true;
    !!selection ? player.addTag(`${option}Enabled`) : player.removeTag(`${option}Enabled`);
    player.sendMessage(`§2${option} has been ${!!selection ? "§2activated" : "§4deactivated"}§r`);
    player.playSound("random.orb", { pitch: 0.8 });
    showMainForm(player);
  });
}

const defaultValues = {
  alert: "§6§l{player}§r§6 has used a totem.",
  achievement: "{player} reached the goal §a[Postmortal]",
};

world.afterEvents.playerSpawn.subscribe((arg) => {
  if (!arg.player.hasTag("TSSETUP:FastTotem")) {
    arg.player.addTag("FastTotemEnabled");
    arg.player.addTag("TSSETUP:FastTotem");
  }
});

world.afterEvents.worldInitialize.subscribe((arg) => {
  const optionsDef = new DynamicPropertiesDefinition();
  optionsDef.defineString("alert", 256, defaultValues.alert);
  optionsDef.defineBoolean("alertShow", false);
  optionsDef.defineString("achievement", 256, defaultValues.achievement);
  optionsDef.defineBoolean("achievementShow", false);
  arg.propertyRegistry.registerWorldDynamicProperties(optionsDef);
});

world.beforeEvents.itemUse.subscribe((arg) => {
  const { itemStack } = arg;
  const source = arg.source;
  if (itemStack?.typeId !== "minecraft:totem_of_undying" && itemStack?.typeId !== "minecraft:shield") {
    return;
  }
  if (!source.hasTag("FastTotemEnabled") && itemStack.typeId === "minecraft:totem_of_undying") {
    return;
  }
  if (!source.hasTag("FastShieldEnabled") && itemStack.typeId === "minecraft:shield") {
    return;
  }
  system.run(() => {
    const offhand = source.getComponent("minecraft:equippable");
    const offhandItem = offhand?.getEquipment(EquipmentSlot.Offhand);
    const container = source?.getComponent("minecraft:inventory")?.container;
    const mainhand = container.getSlot(source.selectedSlot);
    const mainhandItem = container.getItem(source.selectedSlot);
    if (mainhandItem?.typeId !== itemStack.typeId) {
      return;
    }
    offhand.setEquipment(EquipmentSlot.Offhand, mainhandItem);
    source.playSound("armor.equip_chain");
    mainhand.setItem(offhandItem);
  });
});
function genericSyntax(player, command, substr) {
  player.sendMessage({
    rawtext: [
      {
        text: "§c",
      },
      {
        translate: "commands.generic.syntax",
        with: [`${command} `, substr],
      },
    ],
  });
}
function unknownCommand(player, command) {
  player.sendMessage({
    rawtext: [{ text: "§c" }, { translate: "commands.generic.unknown", with: [command.substring(1)] }],
  });
}
world.beforeEvents.chatSend.subscribe(async (argument) => {
  const arg = argument;
  arg.cancel = true;
  system.run(() => {
    const command = arg.message.match(/(!).\w*/)?.[0];
    if (!command) {
      return;
    }

    const parameters = arg.message
      .replace(command, "")
      .match(/@"((?:[^"\\]|\\.)+)"|((?:@[^\s]+)|(?:[^"\s]+))|"([^"]+)"|{(?:[^"\s]+)/g);

    switch (command.substring(1)) {
      case "help": {
        arg.sender.sendMessage("§2--- Showing fast totem help page 1/1 ---§r\n- !help: show this list\n- !config: enter the user configuration interface\n- !alert: player totem activation alert configuration. Usage:\n - !alert set <value: string>\n - !alert reset\n - !alert show <true|false>\n- !achievement: totem first activation alert a.k.a \"achievement\" configuration. Usage:\n - !achievement set <value: string>\n - !achievement reset\n - !achievement show <true|false>")
      } break;
      case "alert": {
        if (!arg.sender.hasTag("TS:Admin")) {
          return unknownCommand(arg.sender, command)
        }
        const subCommand = parameters?.[0] || undefined;
        if (!subCommand) {
          return genericSyntax(arg.sender, command.substring(1), "")
        };
        switch (subCommand) {
          case "set": {
            const newAlertMessage = arg.message.replace(command + " " + subCommand + " ", "");
            world.setDynamicProperty("alert", newAlertMessage);
            arg.sender.playSound("random.orb");
            arg.sender.sendMessage(`§2Totem alert message is now:§7 ${newAlertMessage.replace("{player}", '<player>')}`);
          } break;
          case "reset": {
            world.setDynamicProperty("alert", defaultValues.alert);
            arg.sender.playSound("random.orb");
            arg.sender.sendMessage("§2Totem alert message was reset to its default value.");
          } break;
          case "show": {
            const newValue = parameters[1]?.toLowerCase();
            if (newValue === "true" || newValue === "false") {
              world.setDynamicProperty("alertShow", newValue === "true");
              arg.sender.playSound("random.orb");
              arg.sender.sendMessage(`§2Now the totem alert message will be ${newValue === "true" ? "displayed." : "hidden."}`);
            } else {
              arg.sender.sendMessage("§2You must enter a §4boolean§2 value. (true/false)");
            }
          } break;
          default: {
            if (!subCommand) {
              return genericSyntax(arg.sender, command.substring(1), "")
            };
          }
        }
      } break;

      case "achievement": {
        if (!arg.sender.hasTag("TS:Admin")) {
          return unknownCommand(arg.sender, command)
        }
        const subCommand = parameters?.[0] || undefined;
        if (!subCommand) {
          return genericSyntax(arg.sender, command.substring(1), "")
        };
        switch (subCommand) {
          case "set": {
            const newAchievementMessage = arg.message.replace(command + " " + subCommand + " ", "");
            world.setDynamicProperty("achievement", newAchievementMessage);
            arg.sender.playSound("random.orb");
            arg.sender.sendMessage(`§2Totem postmortal achievement message is now: §7${newAchievementMessage.replace("{player}", '<player>')}.`);
          } break;
          case "reset": {
            world.setDynamicProperty("achievement", defaultValues.achievement);
            arg.sender.playSound("random.orb");
            arg.sender.sendMessage("§2Totem postmortal achievement message was reset to its default value.");
          } break;
          case "show": {
            const newValue = parameters[1]?.toLowerCase();
            if (newValue === "true" || newValue === "false") {
              world.setDynamicProperty("achievementShow", newValue === "true");
              arg.sender.playSound("random.orb");
              arg.sender.sendMessage(`§2Now the totem achievement message will be ${newValue === "true" ? "displayed." : "hidden."}`);
            } else {
              arg.sender.sendMessage("§2You must enter a §4boolean§2 value. (true/false)");
            }
          } break;
          default: {
            arg.sender.sendMessage({
              rawtext: [
                {
                  text: "§c",
                },
                {
                  translate: "commands.generic.syntax",
                  with: [`${command.substring(1)} `, parameters[0]],
                },
              ],
            });
          }
        }
      } break;

      case "config": {
        showMainForm(arg.sender);
        arg.sender.sendMessage(`§2Exit the chat to enter the configuration interface.`);
        arg.sender.playSound("random.orb", { pitch: 0.8 });
      } break;

      default: {
        arg.sender.sendMessage({
          rawtext: [{ text: "§c" }, { translate: "commands.generic.unknown", with: [command.substring(1)] }],
        });
      };
    }
  })
});

world.afterEvents.entityHurt.subscribe((arg) => {
  const { hurtEntity, damage, damageSource } = arg;
  if (damage > 0 || damageSource.cause !== "none") {
    return;
  }
  if (!hurtEntity.hasTag("ReachedPostmortal")) {
    if (world.getDynamicProperty("achievementShow")) {
      const achievementMessage = world.getDynamicProperty("achievement")
        .replace("{player}", hurtEntity.name);
      for (const p of world.getPlayers()) {
        if (p.hasTag("AchievementEnabled")) {
          p.sendMessage({
            rawtext: [
              { text: achievementMessage },
            ],
          });
        }
      }
    }
    hurtEntity.addTag("ReachedPostmortal");
  }
  if (!world.getDynamicProperty("alertShow")) {
    return;
  }
  const message = world.getDynamicProperty("alert")
    .replace("{player}", hurtEntity.name);
  for (const p of world.getPlayers()) {
    if (p.hasTag("PostmortalEnabled")) {
      p.sendMessage({
        rawtext: [
          { text: message },
        ],
      });
    }
  }
});
