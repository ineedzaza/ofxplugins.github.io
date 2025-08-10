const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let imgData, width, height;

document.getElementById('upload').onchange = e => {
  const img = new Image();
  img.src = URL.createObjectURL(e.target.files[0]);
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    imgData = ctx.getImageData(0, 0, width = img.width, height = img.height);
  };
};

function applyPixel(fn) {
  const data = imgData.data;
  for(let i = 0; i < data.length; i += 4) {
    fn(data, i);
  }
  ctx.putImageData(imgData, 0, 0);
}

// Brightness
function brightness(factor) {
  applyPixel((d, i) => {
    d[i] *= factor; d[i+1] *= factor; d[i+2] *= factor;
  });
}

// Invert
function invert() {
  applyPixel((d, i) => {
    d[i] = 255 - d[i];
    d[i+1] = 255 - d[i+1];
    d[i+2] = 255 - d[i+2];
  });
}

// Threshold
function threshold(thresh = 128) {
  applyPixel((d, i) => {
    const v = (d[i] + d[i+1] + d[i+2]) / 3;
    const val = v >= thresh ? 255 : 0;
    d[i] = d[i+1] = d[i+2] = val;
  });
}

// Pixelation
function pixelate(size = 10) {
  for(let y = 0; y < height; y += size) {
    for(let x = 0; x < width; x += size) {
      const i = ((y * width + x) << 2);
      const [r, g, b] = [imgData.data[i], imgData.data[i+1], imgData.data[i+2]];
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, size, size);
    }
  }
}

// Edge Detection (simple)
function edgeDetect() {
  const copy = ctx.getImageData(0, 0, width, height);
  applyPixel((d, i) => {
    const magnitude = Math.abs(d[i] - copy.data[i + 4] || 0) * 5;
    d[i] = d[i+1] = d[i+2] = magnitude;
  });
}

// Posterize
function posterize(levels = 4) {
  applyPixel((d, i) => {
    d[i] = Math.floor(d[i] / (255 / (levels - 1))) * (255 / (levels - 1));
    d[i+1] = Math.floor(d[i+1] / (255 / (levels - 1))) * (255 / (levels - 1));
    d[i+2] = Math.floor(d[i+2] / (255 / (levels - 1))) * (255 / (levels - 1));
  });
}

// Cursor Shadow
canvas.addEventListener('mousemove', e => {
  const {x, y} = e;
  ctx.putImageData(imgData, 0, 0);
  ctx.beginPath();
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fill();
});
