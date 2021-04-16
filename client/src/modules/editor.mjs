export function rotate180(data, len, channels) {
  let r, g, b, a;
  for (let i = 0; i < len / 2; i += channels) {
    r = data[len - 4 - i];
    g = data[len - 3 - i];
    b = data[len - 2 - i];
    a = data[len - 1 - i];

    data[len - 4 - i] = data[i];
    data[len - 3 - i] = data[i + 1];
    data[len - 2 - i] = data[i + 2];
    data[len - 1 - i] = data[i + 3];

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  }
  return data;
}

export function mirror_reflection(data, len, width, height, channels) {
  let r, g, b, a, index_a, index_b;

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < (width * channels) / 2; j += channels) {
      index_a = width * i * channels + j;
      index_b = width * (i + 1) * channels - j;

      r = data[index_a];
      g = data[index_a + 1];
      b = data[index_a + 2];
      a = data[index_a + 3];

      data[index_a] = data[index_b - 4];
      data[index_a + 1] = data[index_b - 3];
      data[index_a + 2] = data[index_b - 2];
      data[index_a + 3] = data[index_b - 1];

      data[index_b - 4] = r;
      data[index_b - 3] = g;
      data[index_b - 2] = b;
      data[index_b - 1] = a;
    }
  }
  return data;
}

export function rotate90(data, len, width, height, channels) {
  let k = 0,
    index = 0,
    new_height = width,
    new_width = height,
    output = new Array(len);

  for (let i = 0; i < new_height; i++) {
    for (let j = 0, h = 0; j < new_width * channels; j += channels) {
      if (j % channels === 0) h++;

      index = width * channels * (height - h) + i * channels;

      output[k] = data[index];
      output[k + 1] = data[index + 1];
      output[k + 2] = data[index + 2];
      output[k + 3] = data[index + 3];

      k += channels;
    }
  }
  return output;
}

export function invert(data, len, channels) {
  for (let i = 0; i < len; i += channels) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  return data;
}

function validateBrightness(value) {
  if (value > 255) return 255;
  if (value < 0) return 0;
  else return value;
}

export function brighten(data, len, brightness, channels) {
  for (let i = 0; i < len; i += channels) {
    data[i] = validateBrightness(data[i] + brightness);
    data[i + 1] = validateBrightness(data[i + 1] + brightness);
    data[i + 2] = validateBrightness(data[i + 2] + brightness);
  }
  return data;
}

export function gray_scale(data, len, channels) {
  let r, a;
  for (let i = 0; i < len; i += channels) {
    r = data[i];
    a = data[i + 3];

    data[i] = r;
    data[i + 1] = r;
    data[i + 2] = r;
    data[i + 3] = a;
  }
  return data;
}

export function crop(
  data,
  len,
  width,
  height,
  top,
  left,
  new_width,
  new_height,
  channels
) {
  let k = 0,
    index = 0,
    output = new Array(new_width * new_height * channels);
  const right_boudary = new_width + left,
    bottom_boudary = new_height + top;

  for (let i = top; i < bottom_boudary; i++) {
    for (
      let j = left * channels;
      j < right_boudary * channels;
      j += channels, k += channels
    ) {
      index = i * width * channels + j;

      output[k] = data[index];
      output[k + 1] = data[index + 1];
      output[k + 2] = data[index + 2];
      output[k + 3] = data[index + 3];
    }
  }
  return output;
}
