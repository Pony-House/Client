// https://scifi.stackexchange.com/a/182823
const MATRIX_CHARACTERS = '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ012345789Z:・."=*+-<>¦｜╌ ｸ';
const CHAR_HEIGHT = 20;
const CHAR_WIDTH = 18;

class Matrix {
  // #region canvas
  /**
   * @type {HTMLCanvasElement}
   */
  #canvas = null;
  /**
   * @type {CanvasRenderingContext2D}
   */
  #ctx = null;
  /**
   * @type {HTMLImageElement}
   */
  #image = null;
  /**
   * @type {ImageData}
   */
  #imageData = null;
  // #endregion

  // #region variables
  /**
   * @type {number}
   */
  #nCols = 0;
  /**
   * @type {number}
   */
  #nRows = 0;
  /**
   * @type {number[]} Which row to draw the character of each column next
   */
  #columnPositions = [];
  /**
   * @type {number}
   */
  #canvasWidth = 800;
  /**
   * @type {number}
   */
  #canvasHeight = 600;
  /**
   * @type {boolean} Automatically resize canvas to fill the window
   */
  #fullscreen = false;
  /**
   * @type {boolean} Draw text flipped (background image retaisn orientation in any case)
   */
  #invert = true;
  /**
   * @type {number[]} Only draws on columns divisible by these numbers in the beginning, to fill the screen slower - becomes null later and all columns are allowed
   */
  #allowedModulos = [];
  /**
   * @type {number} Time until the next allowed modulo will be added
   */
  #moduloTimerMS = 0;
  /**
   * @type {number} Time between adding a new allowed modulo
   */
  #moduloMS = 1000;
  /**
   * @type {boolean} Draw FPS in document title
   */
  #fpsTitle = false;
  #lastDrawTimeMS = -1;
  /**
   * @type {number} Minimum FPS encountered so far
   */
  #minFPS = Infinity;
  // #endregion

  reset() {
    if (this.#fullscreen) {
      this.#canvasWidth = this.#canvas.width = window.innerWidth;
      this.#canvasHeight = this.#canvas.height = window.innerHeight;
    } else {
      this.#canvas.width = this.#canvas.width;
    }

    this.#nCols = Math.floor(this.#canvasWidth / CHAR_WIDTH) + 1;
    this.#nRows = Math.floor(this.#canvasHeight / CHAR_HEIGHT) + 1;
    this.#columnPositions = Array(this.#nCols)
      .fill(0)
      .map(() => Math.floor(Math.random() * this.#nRows));
    this.#canvasWidth = this.#canvas.width;
    this.#canvasHeight = this.#canvas.height;
    this.#allowedModulos.push(parseInt(this.#nCols / 6));
    this.#moduloTimerMS = this.#moduloMS;
    this.processImage();
  }

  /**
   * Make image green
   */
  processImage() {
    let image = this.#image;
    if (image == null) {
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = this.#canvasWidth;
    canvas.height = this.#canvasHeight;
    const ctx = canvas.getContext('2d');

    // draw the image, as big as possible, correct aspect ratio
    const imageAspectRatio = image.width / image.height;
    const canvasAspectRatio = canvas.width / canvas.height;
    let renderableHeight, renderableWidth, xStart, yStart;
    if (imageAspectRatio < canvasAspectRatio) {
      renderableHeight = canvas.height;
      renderableWidth = image.width * (renderableHeight / image.height);
      xStart = (canvas.width - renderableWidth) / 2;
      yStart = 0;
    } else if (imageAspectRatio > canvasAspectRatio) {
      renderableWidth = canvas.width;
      renderableHeight = image.height * (renderableWidth / image.width);
      xStart = 0;
      yStart = (canvas.height - renderableHeight) / 2;
    } else {
      renderableHeight = canvas.height;
      renderableWidth = canvas.width;
      xStart = 0;
      yStart = 0;
    }

    ctx.save();
    if (this.#invert) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(image, xStart, yStart, renderableWidth, renderableHeight);
    ctx.restore();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = imageData.data[i + 1];
      imageData.data[i + 2] = 0;
      if (imageData.data[i + 1] == 0) {
        imageData.data[i + 3] = 0;
      }
    }

    this.#imageData = imageData;
  }

  /**
   * Load the image as Image and set to #image
   * @param {string} imageUrl
   */
  loadImage(imageUrl) {
    // load image
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      this.#image = image;
      this.processImage();
    };
  }

  draw() {
    if (this.#lastDrawTimeMS < 0) {
      this.#lastDrawTimeMS = performance.now();
    } else {
      let now = performance.now();
      let elapsed = now - this.#lastDrawTimeMS;
      let fps = 1000 / elapsed;
      if (fps < this.#minFPS) {
        this.#minFPS = fps;
      }
      this.#lastDrawTimeMS = now;
      if (this.#fpsTitle) {
        document.querySelector('title').innerText =
          `FPS: ${fps.toFixed(2)} Min: ${this.#minFPS.toFixed(2)}`;
      }

      this.#moduloTimerMS -= elapsed;
    }

    if (this.#allowedModulos != null) {
      if (this.#moduloTimerMS <= 0) {
        let last = this.#allowedModulos.at(-1);
        if (last > 1) {
          this.#allowedModulos.push(last - 1);
          this.#moduloTimerMS = this.#moduloMS;
        } else {
          this.#allowedModulos = null;
        }
      }
    }

    let ctx = this.#ctx;

    ctx.fillStyle = `rgba(0, 0, 0, 0.063)`;
    ctx.fillRect(0, 0, this.#canvasWidth, this.#canvasHeight);

    ctx.fillStyle = '#0f0';
    ctx.font = '15pt monospace';

    for (let i = 0; i < this.#columnPositions.length; i++) {
      if (this.#allowedModulos != null) {
        let fail = true;
        for (let allowedModulo of this.#allowedModulos) {
          if (i % allowedModulo == 0) {
            fail = false;
            break;
          }
        }
        if (fail) {
          continue;
        }
      }

      let cnvX = i * CHAR_WIDTH;
      let gridY = this.#columnPositions[i];
      let cnvY = gridY * CHAR_HEIGHT;
      let text = MATRIX_CHARACTERS[Math.floor(Math.random() * MATRIX_CHARACTERS.length)];
      ctx.fillText(text, cnvX, cnvY);
      if (gridY > 10 + Math.random() * this.#nRows * 10) {
        this.#columnPositions[i] = 0;
      } else {
        this.#columnPositions[i]++;
      }
    }

    if (this.#imageData) {
      let matrixImageData = ctx.getImageData(0, 0, this.#canvasWidth, this.#canvasHeight);
      for (let i = 0; i < matrixImageData.data.length; i += 4) {
        let mGreen = matrixImageData.data[i + 1];
        let iGreen = this.#imageData.data[i + 1];
        if (mGreen > 0 && iGreen > 0) {
          matrixImageData.data[i + 1] = iGreen;
        }
      }
      ctx.putImageData(matrixImageData, 0, 0);
    }
  }

  /**
   * Options:
   * - canvas: Canvas element (required)
   * - imageUrl: Background image URL (optional)
   * - fullscreen: Fill canvas to window dimensions automatically (default: false)
   * - invert: Invert text horizontally (default: true)
   * - interval: Interval in milliseconds between each draw (default: 50)
   * - fpsTitle: Update document title with FPS (default: false)
   */
  constructor(options) {
    this.#fullscreen = options.fullscreen;
    this.#canvas = options.canvas;
    this.#invert = options.invert ?? true;
    if (this.#invert) {
      this.#canvas.style.transform = 'scaleX(-1)';
    }
    this.#ctx = this.#canvas.getContext('2d');
    if (this.#fullscreen) {
      window.addEventListener('resize', this.reset.bind(this));
    }
    if (options.imageUrl) {
      this.loadImage(options.imageUrl);
    }
    this.reset();
    this.#fpsTitle = options.fpsTitle ?? false;
    let interval = options.interval ?? 50;
    setInterval(this.draw.bind(this), interval);
  }
}

export default Matrix;
