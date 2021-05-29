var doing = false;

function doSlot(movietitle) {
    if (doing) {
        return null
    };
    doing = true;
    const num = 8;
    var numChanges = randomInt(1, num) * 4;
    var numbSlot1 = numChanges + randomInt(1, num);
    var numbSlot2 = numChanges + 2 * 4 + randomInt(1, num);
    var numbSlot3 = numChanges + 4 * 4 + randomInt(1, num);
    var i1 = 0;
    var i2 = 0;
    var i3 = 0;
    slot1 = setInterval(spin1, 70);
    slot2 = setInterval(spin2, 70);
    slot3 = setInterval(spin3, 70);

    function spin1() {
        i1++;
        slotTile = document.getElementById("slot1");
        if (i1 >= numbSlot1) {
            $("#slot1").attr( 'style', 'background-image: url("moviesposters/' + movietitle+'.jpg");');
            clearInterval(slot1);
            return null;
        }

        if (slotTile.className == "a"+num) {
            slotTile.className = "a0";
        }
        slotTile.className = "a" + (parseInt(slotTile.className.substring(1)) + 1);
    }

    function spin2() {
        i2++;
        slotTile = document.getElementById("slot2");
        if (i2 >= numbSlot2) {
            $("#slot2").attr( 'style', 'background-image: url("moviesposters/' + movietitle+'.jpg");');
            clearInterval(slot2);
            return null;
        }
        if (slotTile.className == "a"+num) {
            slotTile.className = "a0";
        }

        slotTile.className = "a" + (parseInt(slotTile.className.substring(1)) + 1);
    }

    function spin3() {
        i3++;
        slotTile = document.getElementById("slot3");
        if (i3 >= numbSlot3) {
            $("#slot3").attr( 'style', 'background-image: url("moviesposters/' + movietitle+'.jpg");');
            clearInterval(slot3);
            return null;
        }

        if (slotTile.className == "a"+num) {
            slotTile.className = "a0";
        }
        slotTile.className = "a" + (parseInt(slotTile.className.substring(1)) + 1);
    }

}

function randomInt(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}