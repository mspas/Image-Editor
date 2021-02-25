#include <stdio.h>
#include <stdlib.h>
#include <malloc.h>

int doubler(int x) {
  return 2 * x;
}

unsigned char* rotate(unsigned char* data, int len, int channels) {
	unsigned char* rotated = (unsigned char*)malloc(len * sizeof(unsigned char));
	for (int i = 0; i < len; i += channels) {
		rotated[i] = data[len - 3 - i];
		rotated[i + 1] = data[len - 2 - i];
		rotated[i + 2] = data[len - 1 - i];
	}
	return rotated;
}

unsigned char* test2(unsigned char* data) {
	return data;
}

char test3(unsigned char* data) {
	return data[0];
}

int main() {
	return 1;
}