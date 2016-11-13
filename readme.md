# Numbers as Iterarors

ECMAScript proposal, specs, tests, and reference implementation for Numbers as iterators.

This initial proposal was drafted by @johnhenry with input from @_ and @_.

Designated TC39 reviewers: @_ @_

## <a name="table-of-contents"></a>Table of Contents

- [Table of Contents](#table-of-contents)
- [Status](#status)
- [Rationale and Motivation](#rationale-motivation)
- [Prior Art](#prior-art)
  - [Ruby](#prior-art:ruby)
  - [Python](#prior-art:ruby)
  - [Coffeescript](#prior-art:ruby)
- [Proposed Solution: Make Numbers Iterable](#proposed-solution)
  - [for-of loop](#proposed-solution:for-of)
  - [conversion to array](#proposed-solution:conversion-array)
  - [conversion to set](#proposed-solution:conversion-set)
    - [set-theory](#side-note:set-theory)
  - [variadic functions](#proposed-solution:variadic-functions)
  - [negative numbers](#proposed-solution:negative-numbers)
  - [combinations](#proposed-solution:combinations)
- [Specification](#specification)
- [Implementation](#implementation)
  - [Paste](#implementation:paste)
  - [Install](#implementation:install)
- [Language conflicts](#language-conflicts)

## <a name="status"></a>Status

This proposal is currently at stage 0 of the process.

## <a name="rationale-motivation"></a>Rationale and Motivation

There are a few ways to loop through a ordered list of integers, 0 through n-1 in JavaScript.

Using a for loop:

```javascript
//for syntax
for(let i=0; i < n; i++){
    //do something with i
}
```

Using a while loop:

```javascript
//while syntax
let i = 0;
while(i < n){
  //do something with i
  i++;
}
```

Both syntaxes are awkward syntax for a number of reasons:

- they require an explicit, non-constant, declaration of a placeholder,
  ```javascript
  let i = 0
  ```
- they requires an explicit test for said placeholder
  ```javascript
  i < n
  ```
- they require explicit incrementation step of said placeholder
  ```javascript
  i++
  ```

## <a name="prior-art"></a>Prior Art

### <a name="prior-art:ruby"></a>Ruby

In Ruby, this can be achieved more elegantly using a number's [times method](https://ruby-doc.org/core-2.3.1/Integer.html#method-i-times):

```ruby
#number#times syntax
n.times do |i|
  #do something with i
end
```

This can also be achieved with [Ranges](https://ruby-doc.org/core-2.3.1/Range.html).

```ruby
#range#each syntax
(0..n).each do |i|
  #do something with i
end
```

```ruby
#for-in syntax
for i in 0..n
  #do something with i
end
```


### <a name="prior-art:python"></a>Python

Python also achieves this with the concept of [Ranges](https://docs.python.org/3/library/stdtypes.html#typesseq-range).

```python
#for-in syntax
for i in range(n):
  #do something with i
```


### <a name="prior-art:coffeescript"></a>Coffeescript

Coffeescript also achieves this with the concept of [Comprehensions over Ranges](http://coffeescript.org/#loops).

```coffeescript
#for-in syntax
(#do something with i
  for i in [0..n-1])
```

## <a name="proposed-solution"></a>Proposed Solution: Make Numbers Iterable

We can do away with most of the awkwardness using the [iterator protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) to make numbers iterable, yielding 0 to n-1; or -n to -1, if n is negative.

### <a name="proposed-solution"></a>for-of loop

An iterable number can be the target of a [for-of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) loop, mirroring the for-in syntax from other languages:

```javascript
//for-of syntax
for(const i of n){
  //do something with i
}
```

### <a name="proposed-solution:conversion-array"></a>conversion to array

Iterable Numbers can be turned into arrays and use their methods, mimicking Ruby's range#each syntax and allowing other operations.

```javascript
[...n].forEach(i=>{
  //do something with i
});
[...n].map(i=>{
  //do something with i
});
[...n].filter(i=>{
  //do something with i
});
[...n].reduce((_,i)=>{
  //do something with i
});
```

Array.from works similarly for Iterable Numbers.

```javascript
Array.from(n);//[0, 1, ... n-1]
```

### <a name="proposed-solution:conversion-set"></a>conversion to set

Like any iterator, iterable Numbers can be converted into sets.

```javascript
new Set(n);//Set {0,1,...n-1}
```

#### <a name="side-node:set-theory"></a>set theory

On a side note, this fits well with the set theory of integers.

Compare the definition of [von Neumann ordinals]((https://en.wikipedia.org/wiki/Set-theoretic_definition_of_natural_numbers#Definition_as_von_Neumann_ordinals))

```
n := {x in N | x < n};
0 := {}
1 := {0}
2 := {0, 1}
3 := {0, 1, 2}
...
```

to results here.

```javascript
const zero  = new Set(0);//Set {}
const one   = new Set(1);//Set {0}
const two   = new Set(2);//Set {0, 1}
const three = new Set(3);//Set {0, 1, 2}
//...
```

### <a name="proposed-solution:variadic-functions"></a>variadic functions

Iterable Numbers can be spread across variadic functions.

```javascript
const sum = (...numbers)=>numbers.reduce((a, b)=>a+b, 0);
sum(...n);//0 + 1 + ... n-2 + n-1 === (n(n-1))/2
```

### <a name="proposed-solution:negative-numbers"></a>negative numbers

Iterable negative numbers yield the sequence from -n up to -1 instead of 0 up to n-1.

```javascript
[... -n];//[-n, -n+1... -1]
```

### <a name="proposed-solution:combinations"></a>combinations

Iterable numbers can be combined with other iterable objects.

```javascript
[...-n, ...[0,0], ...n+1];//[-n, -n+1... -1, 0, 0, 0 1 ... n-1, n]
```

## <a name="specification"></a>Specification: Number.prototype[Symbol.iterator]

When Number.prototype[Symbol.iterator] is called, the following steps are taken:

- let N be Math.floor(_this_ value)
- if N is 0, return a generator in a "done" state.
- if N is Positive,
  return a generator that yields numbers 0 to N-1
- if N is Negative,
  return a generator that yields numbers N to -1

## <a name="implementation"></a>Implementation
The following code modifies the Number object's prototype, allowing any positive number, n, to be used as an iterator, yielding 0 up to n-1. (technically, the floor of n-1). Negative numbers return a generator yielding n up to -1.

### <a name="implementation:paste"></a>Paste

You can paste it into a console to see this proposal it in action.

```javascript
Object.defineProperty(
Number.prototype,
Symbol.iterator,
{ value: function *(){
    const max = Math.max(0, Math.floor(this));
    let i = Math.min(0, this);
    while(i < max) {
      yield i;
      i+=1;
    }
    return;
  }
});
```

### <a name="implementation:import"></a>Import

You can import the included "make-numbers-iterable.js" file and import it into a project.

```javascript
import './make-numbers-iterable';
//...
```

## <a name="language-conflicts"></a>Language conflicts

Currently, where an iterator is expected, but a number is expected, a type error is thrown:

```javascript
TypeError: (var)[Symbol.iterator] is not a function(…)
```

As such, this should not cause conflicts with existing working code.
