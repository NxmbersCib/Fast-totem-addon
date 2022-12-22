# Este archivo fue escrito por CibNumeritos#1094, cualquier uso, modificación o intento de lucro sin autorización del mismo sera penalizado. 
# This file was written by CibNumeritos#1094, any use, modification or profit intent whitout their autorization will be penalized. 
replaceitem entity @s[hasitem=[{location=slot.weapon.mainhand,item=totem_of_undying,quantity=1},{location=slot.weapon.offhand,item=totem_of_undying,quantity=0}]] slot.weapon.offhand 0 keep totem_of_undying
execute as @s[hasitem=[{location=slot.weapon.mainhand,item=totem_of_undying,quantity=1},{location=slot.weapon.offhand,item=totem_of_undying,quantity=1}]] run replaceitem entity @s[hasitem=[{location=slot.weapon.mainhand,item=totem_of_undying,quantity=1},{location=slot.weapon.offhand,item=totem_of_undying,quantity=1}]] slot.weapon.mainhand 0 air
playsound armor.equip_generic @s[hasitem=[{location=slot.weapon.offhand,item=totem_of_undying,quantity=1},{location=slot.weapon.mainhand,item=totem_of_undying,quantity=0}]]
