#include <stdio.h>


int main(){
    char * p ;
    int n = 2 ;
    if( n % 2 == 0 ) {
        char c = 'A';
        p = &c;


    }

    printf ("%c\n", * p ) ;

}

