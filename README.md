# RandomStuff
A collection of random stuff which aren't significant enough to deserve their own seperate repositories.

# ChocolateHelper
Many features for the Chocolate Factory:
    - Auto-buy best rabbit
    - Autoclicker
    - Overlays
    - Egg Esp & Timers
    - Rabbit Count

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

# PianoProdigy
Harp should not be part of progressing.

Does harp for you!

/harpdelay \<ticks\> to change delay. Lower values recommended for faster songs.

Detects the wool block one slot before you should click, so low ping players should have their delay set higher than players with high ping. For me (250ms) on the faster songs, 2-3 ticks of delay works reliably.


# IHateCarpet
Literally just turns carpets near you into ghost blocks temporarily so watchdog screams at you less.



