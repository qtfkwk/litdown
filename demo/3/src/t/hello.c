#include <stdio.h>
#include <assert.h>
#include <string.h>
#include <stdbool.h>

int main ()
{
	char *command = "./hello";
	FILE *fp = popen (command, "r");
	char *expected = "Hello!\n";	
	bool match = true;
	int i;
	char c = fgetc (fp);
	int len = strlen (expected);
	for (i = 0; match && c != EOF && i < len; i++)
	{
		match = c == expected[i];
		c = fgetc (fp);
	}
	assert (i == len);
	assert (match);
	int e = pclose (fp) >> 8;
	assert(e == 0);
}
