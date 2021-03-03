#include <stdio.h>
#include <stdlib.h>
#include <malloc.h>

int doubler(int x)
{
	return 2 * x;
}

void rotate(unsigned char *data, int len, int channels)
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
	for (int i = 0; i < len / 2; i += channels)
	{
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

void rotate2(unsigned char *data, int len, int channels)
{
	char r, g, b, a;
	for (int i = 0; i < len / 2; i += channels)
	{
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
void test2(unsigned char *data)
{
	data[1] = 97;
}

char test3(unsigned char *data)
{
	return data[0];
}

int main()
{
	return 1;
}