# treat-like

Validation and sanitize complex data structures with ease. 



## Features

- Supports plain values, objects, lists and tuples in any combination
- Writen on TypeScript, fully type safe



## Installation

Using npm:

```bash
$ npm install treat-like
```



Using yarn:

```bash
$ yarn add treat-like
```





## Examples

### Processing plain string

```javascript
const { treatLike, string, gte, lowercased, trimmed } = require("treat-like");

// start with defining schema
const usernameSchema = string()
    .then(trimmed) // converter, trimm function acts like x => x.trim() for strings
    .then(lowercased) // converter, lowercases input
    .check(gte(6), "length must be at least 6 symbols"); // validator, and optional error message if condition not met

// valid input
treatLike(" Nick12", usernameSchema)
    .then(report => {
        console.log(report.ok); // true
        console.log(report.value); // "nick12"
        console.log(report.error); // undefined
    })

// invalid input
treatLike(" Foo", usernameSchema)
    .then(report => {
        console.log(report.ok); // false
        console.log(report.value); // undefined
        console.log(report.error); // "length must be at least 6 symbols"
    })
```



### Complex model validation

```javascript
const { treatLike, string, gte, gt, lowercased, trimmed, provided, match, bydefault } = require("treat-like");

// define common pattern
const requiredString = string("invalid_type").check(provided).then(trimmed).check(gt(0));

// phone number schema
const phoneSchema = requiredString.check(match(/^\d{9}$/), "invalid_format");

// user schema
const userSchema = {
    username: requiredString.then(lowercased).check(gte(6), "too_short"),
    contacts: { // sub schema
        email: string().then(bydefault(null)), // optional field, return null if not provided
        phoneNumbers: [phoneSchema], // list of phone numbers
    }
};

// valid input
const validInput = JSON.parse(JSON.stringify({
    username: "atomAltera",
    contacts: {
        // email: undefined 
        phoneNumbers: ["345123231", "231232333", "786765654"],
    }
}));

treatLike(userSchema, validInput)
    .then(report => {
        console.log(report.ok); // true
        console.log(report.error); // {username: undefined, contacts: {email: undefined, phoneNumbers: [undefined, undefined, undefined]}}
        console.log(report.value); // {username: "atomaltera", contacts: {email: null, phoneNumbers: ["345123231", "231232333", "786765654"]}}
    })  

// invalid input
const invalidInput = JSON.parse(JSON.stringify({
    username: "dex",
    contacts: {
        // email: undefined,
        phoneNumbers: [123456432, "231232333", "1231"],
    }
}));

treatLike(userSchema, invalidInput)
    .then(report => {
        console.log(report.ok); // false
        console.log(report.error); // {username: "too_short", contacts: {email: undefined, phoneNumbers: ["invalid_type", undefined, "invalid_format"]}}
        console.log(report.value); // {username: "atomaltera", contacts: {email: null, phoneNumbers: [undefined, "231232333", undefined]}}
    });
```

