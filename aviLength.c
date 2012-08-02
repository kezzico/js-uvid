#include <stdio.h>

int main(int argc, char** argv) {
  int delay=0, frames=0;

  char *file = argv[1];
  FILE *fp = fopen(file, "r");
  if(!fp) return 1;

  fseek(fp, 32, SEEK_SET);
  fread(&delay,4, 1, fp);
  fseek(fp, 12, SEEK_CUR);
  fread(&frames,4,1, fp);
  fclose(fp);

  printf("%d", (int)(((float)delay / 1000000.0f)*(float)frames));
  return 0;
}
