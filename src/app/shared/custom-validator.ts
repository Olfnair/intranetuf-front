import { FormControl } from '@angular/forms';

export class CustomValidators {
    /**
      * Function to control email with custom validator
      *
      * @param control
      *
      * @returns {{googleEmail: boolean}}
      */
    static googleEmail(control: FormControl) {
        // email regex
        const regex = /^\w+\.\w+@gmail\.com$/;
        // returns control
        return regex.test(control.value) ? null : {
            googleEmail: true
        }
    }

    /**
     * Function to control email with custom validator
     *
     * @param control
     *
     * @returns {{email: boolean}}
     */
    static email(control: FormControl) {
        // email regex
        // http://emailregex.com/
        const regex =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        // returns control
        return regex.test(control.value) ? null : {
            email: true
        }
    }
}
