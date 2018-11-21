# treat-like

Validation and sanitize complex data structures with ease. 



## Features

- Provides both, validation and sanitization features
- Supports simple values, objects, lists and tuples in any combination
- Writen on TypeScript, fully type safe
- Supports promises



## Table of contents

[TOC]


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

### Working with plain value

```javascript
const { treatLike, string, gte, lowercased, trimmed } = require("treat-like");

// start with defining schema
const usernameSchema = string()
    .then(trimmed) // converter, trimm function acts like x => x.trim() for strings
    .then(lowercased) // converter, lowercases input
    .check(gte(6), "length must be at least 6 symbols"); // validator, and optional error message if condition not met

// valid input
treatLike(usernameSchema, " Nick12", )
    .then(report => {
        console.log(report.ok); // true
        console.log(report.value); // "nick12"
        console.log(report.error); // undefined
    })

// invalid input
treatLike(usernameSchema, " Foo")
    .then(report => {
        console.log(report.ok); // false
        console.log(report.value); // undefined
        console.log(report.error); // "length must be at least 6 symbols"
    })
```



### Validating object

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



## Types

### Converter

`Converter` type represents converting function from type `A` to type `B`. Defined as:

```typescript
type Converter<A, B> = (a: A) => B | Promise<B>;
```





### Validator

`Validator` type represents validating function of value of type `A`. Defined as: 

```typescript
type Validator<A> = (a: A) => boolean | Promise<boolean>;
```





### Chain

`Chain` is the basic unit that provides facilities of validation and transformation.

Can be created with [constructors](constructors).

Defined as object of two types `I` — input chain type, and `C` — current chain type (output chain type), and provides tree methods: `.then()`, `.check()` and `.apply()`. Defined as: 

```typescript
interface Chain<I, C> {
    check: (validator: Validator<C>, message?: string) => Chain<I, C>;
    then: <N>(converter: Converter<C, N>, message?: string) => Chain<I, N>;

    apply(value: I): Promise<C>;
}
```



#### .check(validator)

Append validation step to chain. Returns the same chain instance.



#### .then(converter)

Appends transformation step to chain. Accepts `converter` from current chain type `C` to next type `N`. Returns new chain instance of type `Chain<I, N>`



#### .apply(value)

Apply all validation and transformation steps in current chain agains `value`. Returns promise of output type. 

If all validation step pass and no convertion steps throw error, promise resolve to result value. Otherwise promise is rejected with error message of first failed step.

This method should not be used directry, use [treatLike](#treatLike(schema, input)) function instead.





### Schema

Shema type represents validation and transformation rules for input data. Can be instance of [Chain](#Chain), object, list of single elemet (treated as array), list of two and more elements (treated as tuple) and any other value (see behavior of [treatLike](#treatLike(schema, input)) function).





### Errors

Represents validation and converting errors, is part of [ErrorReport](#ErrorReport) and mimics shape of [Schema](#Schema).

Defined as:

```typescript
export type Errors<S> =
	S extends Chain<any, any> ? string | undefined :
	S extends { [K: string]: any } ? { [K in keyof S]: Errors<S[K]> } :
	string | undefined;
```

Where `S` is [Schema](#Schema).





### FullOutput

Provides values for all fields defined in coresponding [Schema](#Schema). Mimics shape of [Schema](#Schema). Is part of [OkReport](#OkReport).

Defiend as:

```typescript
export type FullOutput<S> =
	S extends Chain<any, infer C> ? C :
	S extends { [K: string]: any } ? { [K in keyof S]: Input<S[K]> } :
	S;
```

Where `S` is [Schema](#Schema).





### PartialOutput

Provides values for fields that pass all validation and transformation steps defined in coresponding [Schema](#Schema). Mimics shape of [Schema](#Schema). Is part of [ErrorReport](#ErrorReport).

Defiend as:

```typescript
type PartialOutput<S> =
	S extends Chain<any, infer C> ? C | undefined :
	S extends { [K: string]: any } ? { [K in keyof S]: Input<S[K]> } :
	S;
```

Where `S` is [Schema](#Schema).





### OkReport

Value of this type is returned by [treatLike](#treatLike(schema, input)) in case of successful ending.

Consists of three feilds: `ok` set to **true**, `value` of type [FullOutput](#FullOutput) and `error` of type [Errors](#Errors). 

All final values in `error` are **undefuned**. This field is set just to avoid unnesasary checks in templates.

For example in JSX: `<span className="errors">{report.error.user.contacts.phones[i]}</span>`

Defiend as:

```typescript
interface OkReport<S> {
    ok: true;
    value: FullOutput<S>;
    error: undefined;
}
```

Where `S` is [Schema](#Schema).





### ErrorReport

Value of this type is returned by [treatLike](#treatLike(schema, input)) in case of some validation or converion failed. 

Consists of three feilds: `ok` set to **false**, `value` of type [PartialOutput](#PartialOutput) and `error` of type [Errors](#Errors). 

Defined as:

```typescript
 interface ErrorReport<S> {
    ok: false;
    error?: Errors<S>;
    value?: PartialOutput<S>;
}
```

Where `S` is [Schema](#Schema).





### Report

Defined as a union of [OkReport](#OkReport) and [ErrorReport](#ErrorReport):

```typescript
type Report<S> = OkReport<S> | ErrorReport<S>;
```

Where `S` is [Schema](#Schema).