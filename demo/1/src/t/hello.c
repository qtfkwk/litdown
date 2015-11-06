#include <stdio.h>
#include <assert.h>

int main ()
{
	char *command = "./hello";
	FILE *fp = popen (command, "r");
	int e = pclose (fp) >> 8;
	assert(e == 0);
}
