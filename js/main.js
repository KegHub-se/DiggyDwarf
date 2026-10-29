
const GAME_WIDTH = 360;
const GAME_HEIGHT = 760;

const COLS = 7;
const ROWS = 12;
const TILE_SIZE = 44;
const GRID_X = 26;
const GRID_Y = 130;

class MineScene extends Phaser.Scene {
  constructor() {
    super("MineScene");
  }

  create() {
    this.tiles = [];
    this.player = { x: 3, y: 10 };
    this.oreScore = 0;
    this.message = "Tap a neighboring tile to explore.";

    this.drawBackground();
    this.createLabels();
    this.generateMine();
    this.drawMine();
    this.drawPlayer();

    this.input.on("pointerdown", (pointer) => {
      this.handleTap(pointer.x, pointer.y);
    });
  }

  drawBackground() {
    this.cameras.main.setBackgroundColor("#202b2b");

    const graphics = this.add.graphics();
    graphics.fillStyle(0x293737, 1);
    graphics.fillRoundedRect(12, 12, 336, 736, 18);
  }

  createLabels() {
    this.add.text(180, 30, "DIGGYDWARF", {
      fontFamily: "Arial",
      fontSize: "25px",
      fontStyle: "bold",
      color: "#f4d6a0"
    }).setOrigin(0.5, 0);

    this.add.text(180, 66, "A little dwarf. A big mountain.", {
      fontFamily: "Arial",
      fontSize: "13px",
      color: "#b9c8bb"
    }).setOrigin(0.5, 0);

    this.scoreLabel = this.add.text(24, 95, "Ore collected: 0", {
      fontFamily: "Arial",
      fontSize: "15px",
      color: "#f4d6a0"
    });

    this.messageLabel = this.add.text(180, 692, this.message, {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#e4e9dc",
      align: "center",
      wordWrap: { width: 310 }
    }).setOrigin(0.5, 0);
  }

  generateMine() {
    for (let y = 0; y < ROWS; y++) {
      this.tiles[y] = [];

      for (let x = 0; x < COLS; x++) {
        // Leave the dwarf's starting tile empty.
        if (x === this.player.x && y === this.player.y) {
          this.tiles[y][x] = { type: "empty" };
          continue;
        }

        const roll = Math.random();
        let type = "rock";

        if (roll < 0.16) {
          type = "empty";
        } else if (roll < 0.25) {
          type = "copper";
        } else if (roll < 0.29) {
          type = "iron";
        }

        this.tiles[y][x] = { type };
      }
    }

    // Keep the tile immediately above the dwarf clear
    // so the first move is easy to test.
    this.tiles[this.player.y - 1][this.player.x] = {
      type: "empty"
    };
  }

    drawMine() {
    // Remove old ore labels before drawing the mine again.
    this.children.list.slice().forEach((child) => {
      if (child.name && child.name.startsWith("tile-")) {
        child.destroy();
      }
    });

    if (this.mineGraphics) {
      this.mineGraphics.destroy();
    }

    this.mineGraphics = this.add.graphics();

    if (this.mineGraphics) {
      this.mineGraphics.destroy();
    }

    this.mineGraphics = this.add.graphics();

    const colors = {
      rock: 0x626d6b,
      empty: 0x354441,
      copper: 0xc8794b,
      iron: 0xaeb9bd
    };

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const tile = this.tiles[y][x];
        const px = GRID_X + x * TILE_SIZE;
        const py = GRID_Y + y * TILE_SIZE;

        this.mineGraphics.fillStyle(colors[tile.type], 1);
        this.mineGraphics.fillRoundedRect(
          px + 2, py + 2,
          TILE_SIZE - 4, TILE_SIZE - 4,
          6
        );

        if (tile.type === "copper") {
          this.add.text(
            px + TILE_SIZE / 2,
            py + TILE_SIZE / 2,
            "Cu",
            {
              fontFamily: "Arial",
              fontSize: "13px",
              fontStyle: "bold",
              color: "#ffffff"
            }
          ).setOrigin(0.5).setName(`tile-${x}-${y}`);
        }

        if (tile.type === "iron") {
          this.add.text(
            px + TILE_SIZE / 2,
            py + TILE_SIZE / 2,
            "Fe",
            {
              fontFamily: "Arial",
              fontSize: "13px",
              fontStyle: "bold",
              color: "#243238"
            }
          ).setOrigin(0.5).setName(`tile-${x}-${y}`);
        }
      }
    }
  }

  drawPlayer() {
    if (this.playerGraphic) {
      this.playerGraphic.destroy();
    }

    const px = GRID_X + this.player.x * TILE_SIZE;
    const py = GRID_Y + this.player.y * TILE_SIZE;

    this.playerGraphic = this.add.graphics();

    // Simple placeholder dwarf: warm face and brown helmet.
    this.playerGraphic.fillStyle(0x8b5a36, 1);
    this.playerGraphic.fillRoundedRect(
      px + 7, py + 5, 30, 33, 9
    );

    this.playerGraphic.fillStyle(0xf0c28a, 1);
    this.playerGraphic.fillCircle(
      px + TILE_SIZE / 2, py + 18, 10
    );

    this.playerGraphic.fillStyle(0xead9bc, 1);
    this.playerGraphic.fillTriangle(
      px + 9, py + 22,
      px + 35, py + 22,
      px + 22, py + 38
    );

    this.playerGraphic.fillStyle(0x27312f, 1);
    this.playerGraphic.fillCircle(px + 19, py + 18, 1.5);
    this.playerGraphic.fillCircle(px + 26, py + 18, 1.5);
  }

  handleTap(pointerX, pointerY) {
    const x = Math.floor((pointerX - GRID_X) / TILE_SIZE);
    const y = Math.floor((pointerY - GRID_Y) / TILE_SIZE);

    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
      return;
    }

    const distance =
      Math.abs(x - this.player.x) +
      Math.abs(y - this.player.y);

    if (distance !== 1) {
      this.setMessage("Choose a neighboring tile.");
      return;
    }

    const tile = this.tiles[y][x];

    if (tile.type === "empty") {
      this.player.x = x;
      this.player.y = y;
      this.setMessage("One step deeper into the mountain.");
      this.drawPlayer();
      return;
    }

    if (tile.type === "copper") {
      this.oreScore += 1;
      this.setMessage("Copper found! +1 ore");
    } else if (tile.type === "iron") {
      this.oreScore += 2;
      this.setMessage("Iron found! +2 ore");
    } else {
      this.setMessage("Rock dug out. The tile is now clear.");
    }

    // Digging clears the tile but doesn't move the dwarf.
    tile.type = "empty";
    this.removeTileLabel(x, y);
    this.scoreLabel.setText(`Ore collected: ${this.oreScore}`);
    this.drawMine();
    this.drawPlayer();
  }

  removeTileLabel(x, y) {
    const label = this.children.getByName(`tile-${x}-${y}`);

    if (label) {
      label.destroy();
    }
  }

  setMessage(message) {
    this.message = message;
    this.messageLabel.setText(message);
  }
}

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-container",
  backgroundColor: "#202b2b",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MineScene]
};

new Phaser.Game(config);
