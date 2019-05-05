//@ts-check
var splashes = [
    "Please suggest us a new name",
    "Made by hackers for hackers.      You know who you are",
    "You opened this menu, thanks",
    "👨‍🔧Thank you so much for pl.. <b>using</b> my extention",
    "We want Experiment 3!",
    "RocketSnail is... A SNAIL!",
    "Beaver or Hamster? This is the real question",
    "Sub to BC Bulletin",
    "Retro Critters is avaible if you want the Experiment 1 back",
    "/may4th be with you",
    "/rocketsnail is the game creator!",
    "Join BC modding Community!",
    "Want to create or download BC mods? Join the BC Modding Community"
];

document.addEventListener('DOMContentLoaded', () => {
document.getElementById('splash').innerHTML = splashes[Math.floor(Math.random() * splashes.length)];
});