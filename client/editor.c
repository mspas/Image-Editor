#include <stdio.h>
#include <stdlib.h>
#include <malloc.h>

void rotate180(unsigned char* data, int len, int channels) 
{	
	/*char temp;
	for (int i = 0; i < len / 2; i += channels) {
		for (int j = 0; j < channels; j++) {
			temp = data[len - channels - j - i];
			data[len - channels - j - i] = data[i + j];
			data[i + j] = temp;
		}
	}*/
	char r, g, b, a;
	for (int i = 0; i < len / 2; i += channels) {
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
}

void mirror_reflection(unsigned char* data, int len, int width, int height, int channels) 
{
	char r, g, b, a;
	int index_a, index_b;

	for (int i = 0; i < height; i++)
	{
		for (int j = 0; j < width * channels / 2; j += channels)
		{
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
}

void rotate90(unsigned char* data, unsigned char* output, int len, int width, int height, int channels) 
{
	int k = 0, index = 0;
	int new_height = width, new_width = height;
	
	for (int i = 0; i < new_height; i++)
	{
		for (int j = 0, h = 0; j < new_width*channels; j += channels)
		{
			if (j % channels == 0)
			{
				h++;
			}

			index = (width*channels) * (height - h) + i*channels;

			output[k] = data[index];
			output[k + 1] = data[index + 1];
			output[k + 2] = data[index + 2];
			output[k + 3] = data[index + 3];

			k += channels;
		}
	}
}

void invert(unsigned char* data, int len, int channels) 
{
	for (int i = 0; i < len; i += channels)
	{
		data[i] = 255 - data[i];
		data[i + 1] = 255 - data[i + 1];
		data[i + 2] = 255 - data[i + 2];
	}
}

int validate_brightness(int value)
{
	if (value > 255)
		return 255;
    if (value < 0)
		return 0;
	else
		return value;
}

void brighten(unsigned char* data, int len, int brightness, int channels) 
{
	for (int i = 0; i < len; i += channels) 
	{
		data[i] = validate_brightness(data[i] + brightness);
		data[i + 1] = validate_brightness(data[i + 1] + brightness);
		data[i + 2] = validate_brightness(data[i + 2] + brightness);
	}
}

void gray_scale(unsigned char* data, int len, int channels)
{
	for (int i = 0; i < len; i += channels)
	{
		int r = data[i];
		int a = data[i + 3];

		data[i] = r;
		data[i + 1] = r;
		data[i + 2] = r;
		data[i + 3] = a;
	}
}

int main() {
	return 1;
}