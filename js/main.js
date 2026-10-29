
const GAME_WIDTH = 360;
const GAME_HEIGHT = 760;

const COLS = 7;
const ROWS = 60;
const TILE_SIZE = 44;
const GRID_X = 26;
const GRID_Y = 130;

class MineScene extends Phaser.Scene {
  constructor() {
    super("MineScene");
  }

  create() {
    this.tiles = [];
    this.player = { x: 3, y: 1 };
    this.oreScore = 0;
    this.message = "Tap a neighboring tile to explore.";

    this.generateMine();
    this.drawBackground();
    this.createLabels();
    this.drawMine();
    this.drawPlayer();

    const worldHeight = GRID_Y + ROWS * TILE_SIZE + 40;

    this.physicsWorldHeight = worldHeight;

    this.cameras.main.setBounds(
      0, 0, GAME_WIDTH, worldHeight
    );

    this.cameras.main.startFollow(
      this.playerGraphic, true, 0.12, 0.12
    );

    this.input.on("pointerdown", (pointer) => {
      this.handleTap(pointer.worldX, pointer.worldY);
    });
  }

  drawBackground() {
    this.cameras.main.setBackgroundColor("#202b2b");

    const panel = this.add.graphics();
    panel.fillStyle(0x293737, 1);
    panel.fillRoundedRect(12, 12, 336, 736, 18);
    panel.setScrollFactor(0);
    panel.setDepth(-100);
  }

  createLabels() {
    this.titleLabel = this.add.text(
      180, 30, "DIGGYDWARF",
      {
        fontFamily: "Arial",
        fontSize: "25px",
        fontStyle: "bold",
        color: "#f4d6a0"
      }
    ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

    this.subtitleLabel = this.add.text(
      180, 66, "A little dwarf. A big mountain.",
      {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#b9c8bb"
      }
    ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

    this.scoreLabel = this.add.text(
      24, 95, "Ore collected: 0",
      {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#f4d6a0"
      }
    ).setScrollFactor(0).setDepth(101);

    this.depthLabel = this.add.text(
      336, 95, "Depth: 0",
      {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#b9c8bb"
      }
    ).setOrigin(1, 0).setScrollFactor(0).setDepth(101);

    this.messageLabel = this.add.text(
      180, 710, this.message,
      {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#e4e9dc",
        align: "center",
        wordWrap: { width: 310 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(101);
  }

  generateMine() {
    for (let y = 0; y < ROWS; y++) {
      this.tiles[y] = [];

      for (let x = 0; x < COLS; x++) {
        if (x === this.player.x && y === this.player.y) {
          this.tiles[y][x] = { type: "empty" };
          continue;
        }

        const depth = y;
        const roll = Math.random();

        let type = "rock";

        if (roll < 0.13) {
          type = "empty";
        } else if (roll < 0.21 + depth * 0.0015) {
          type = "copper";
        } else if (roll < 0.23 + depth * 0.0025) {
          type = "iron";
        } else if (
          depth >= 25 &&
          roll > 0.994 - depth * 0.00015
        ) {
          type = "gem";
        } else if (
          depth >= 12 &&
          roll > 0.985 - depth * 0.0002
        ) {
          type = "gold";
        }

        this.tiles[y][x] = { type };
      }
    }

    // Give the dwarf a clear first step downward.
    this.tiles[2][3] = { type: "empty" };
  }

  drawMine() {
    if (this.mineGraphics) {
      this.mineGraphics.destroy();
    }

    if (this.oreLabels) {
      this.oreLabels.clear(true, true);
    }

    this.mineGraphics = this.add.graphics();
    this.oreLabels = this.add.group();

    const colors = {
      rock: 0x626d6b,
      empty: 0x354441,
      copper: 0xc8794b,
      iron: 0xaeb9bd,
      gold: 0xe3bc52,
      gem: 0x65c9b7
    };

    const symbols = {
      copper: { text: "Cu", color: "#ffffff" },
      iron: { text: "Fe", color: "#243238" },
      gold: { text: "Au", color: "#4b3514" },
      gem: { text: "♦", color: "#173d39" }
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

        const symbol = symbols[tile.type];

        if (symbol) {
          const label = this.add.text(
            px + TILE_SIZE / 2,
            py + TILE_SIZE / 2,
            symbol.text,
            {
              fontFamily: "Arial",
              fontSize: "13px",
              fontStyle: "bold",
              color: symbol.color
            }
          ).setOrigin(0.5);

          this.oreLabels.add(label);
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

    this.playerGraphic.setDepth(10);
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

      this.setMessage("Deeper into the mountain!");
      this.drawMine();
      this.drawPlayer();
      this.updateStatus();
      return;
    }

    if (tile.type === "copper") {
      this.oreScore += 1;
      this.setMessage("Copper found! +1 ore");
    } else if (tile.type === "iron") {
      this.oreScore += 2;
      this.setMessage("Iron found! +2 ore");
    } else if (tile.type === "gold") {
      this.oreScore += 5;
      this.setMessage("Gold found! +5 ore");
    } else if (tile.type === "gem") {
      this.oreScore += 10;
      this.setMessage("Gem found! +10 ore");
    } else {
      this.setMessage("Rock cleared! Tap it again to move.");
    }

    tile.type = "empty";

    this.drawMine();
    this.drawPlayer();
    this.updateStatus();
  }

  updateStatus() {
    this.scoreLabel.setText(
      `Ore collected: ${this.oreScore}`
    );

    this.depthLabel.setText(
      `Depth: ${Math.max(0, this.player.y - 1)}`
    );
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
