# RandomStuff
A collection of random stuff which aren't significant enough to deserve their own seperate repositories.

# AutoCroesus
Automatically claims chests in the Croesus NPC in the Dungeon Hub, with lots of options to configure how the module behaves.
By far the largest module here currently, probably deserves its own repo.

When the user runs //ac go, the module will search for the Croesus npc and check to see if it's close enough to click. Once the chest menu opens, it will find the first run with unclaimed chests and click on it.
Once that run is opened, it will scan the items in the gui, extract the item names and the chest costs for each of the chests, parse them into the Skyblock item IDs, and then calculate how much profit each chest is based off of the Hypixel Bazaar API and Moulberry's lowestbin.json API (which are refreshed automatically when turning on auto claiming after 30 minutes or longer).

If the user has rerolls enabled for the current floor, and the bedrock chest profit is lower than the configured reroll profit, then the bedrock chest will be rerolled and the run will be reopned and have its profit recalculated.
* If rerolls are turned on but the user does not have kismets available, then every chest on this floor will be skipped until rerolls are turned off or the user has kismets.

Since the wood chest is always profit, that means that there will always be at least one profitable chest, so at least one chest is always claimed for each run.
If the user has chest keys turned on, and the chest with the second highest profit chest is profitable enough (Configurable), then that second chest will be opened as well.

This process will continue for every chest, and will also loot chests on other pages until there are no more chests to loot, and the module will stop.

When the loot for a run is calculated, it will log the floor, the run score, the chest cost and all of the items which will be claimed to a file which can be viewed at any time in the future with the "/autocroesus loot" command. This will show every single item and essence which this module has claimed, and will show you on average how much profit each run on that floor is worth based on your runs.
This command has several filters available to only show runs on a specific floor, with a specific score, and only show the first x runs etc, so run "/autocroesus loot help" for an example on how to use it.
[runlogs](https://i.imgur.com/ErOcENh.png)

The module also contains an overlay which highlights runs which haven't been looted yet and shows the profits for each chest (sorted in descending order) without the auto claiming part being enabled.
[overlay](https://i.imgur.com/KMCPnXq.png)

Due to the risk associated with items having their prices be manipulated, there are two lists of items included with the module:
* An "Always Buy" list, where no matter how much profit the overall chest is, if it contains one of these items then the chest will always be opened.
* And a "Worthless" list, where every item in this list has their value set to 0, which means that low value books like Bank or Combo can't be manipulated and claimed over more profitable chests.

Both of these lists are configurable, and you can change and view their items at any time, or reset them back to their defaults.

Since inventory interactions are ping dependent, people with low ping will be able to claim chests significantly quicker than people with high ping, to the point where it could look suspicious to other people in chat when rare rewards start popping up impossibly fast. For this reason, you can configure how long the module will wait in between each click, with the default delay set to 250ms.

I'm not sure how safe it would be from a watchdog perspective, but if you have <50ms ping, and set the delay to 50ms or less, please send me a video of what it looks like looting a whole bunch of chests because I think that would be hilarious.

Here's a small demo of the module looting a bunch of M5 runs with a delay of 250ms, chest keys enabled and no kismets: (video)[https://www.youtube.com/watch?v=LUuHczvyfpE]

# ZeroPingEtherwarp
Instantly teleports you to the target block when attempting to etherwarp.

Sends packets to simulate true zero ping. After you click, you can immediately change directions and teleport again even before the server has processed the first teleport.
Safeguards are in place to protect against excessive packets being sent, however there are no checks for whether or not etherwarping is actually possible in the area you're in.
Use with caution, don't be stupid with it.

Use /zeropingetherwarp or /zpew to show the available commands for the module.

## How it works
Normally when you etherwarp, you send a use item packet, the server does a raycast to find the block to put you on, and then sends you an S08PacketPlayerPosLook packet to tell your client where you should be teleported to. In response, you send a C06PacketPlayerPosLook packet to confirm the teleport and sync back with the server.

With zero ping etherwarp, when you right click with an etherwarp item, the module will do a raycast and predict where the server will put you, then teleport you to that location and send the C06PacketPlayerPosLook as well. When the server has registered that you've tried to etherwarp and sends the S08PacketPlayerPosLook packet, the coordinates are checked with the ones which the module predicted, and if they match, the packet event is cancelled since the C06 response has already been sent and you are already at that location.

![How it works](https://i.imgur.com/sQTRaEj.png)

# Left Click Etherwarp
When left clicking with an item with etherwarp on it, will automatically sneak and then right click. Goes well with ZeroPingEtherwarp.

# ChocolateHelper
Many features for the Chocolate Factory that aim to automate Hypixel's Cookie Clicker and also some good legit features.

# PianoProdigy
Harp should not be part of progressing.

Does harp for you!

/harpdelay \<ticks\> to change delay. Lower values recommended for faster songs.

Detects the wool block one slot before you should click, so low ping players should have their delay set higher than players with high ping. For me (250ms) on the faster songs, 2-3 ticks of delay works reliably.


# IHateCarpet
Literally just turns carpets near you into ghost blocks temporarily so watchdog screams at you less.



