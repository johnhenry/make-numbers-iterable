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
  - [Python](#prior-art:python)
  - [Coffeescript](#prior-art:coffeescript)
- [Proposed Solution: Make Numbers Iterable](#proposed-solution)
  - [for-of loop](#proposed-solution:for-of)
  - [conversion to array](#proposed-solution:conversion-array)
  - [conversion to set](#proposed-solution:conversion-set)
    - [set-theory](#side-note:set-theory)
  - [variadic functions](#proposed-solution:variadic-functions)
  - [infinite loops](#proposed-solution:infinite-loops)
  - [destructuring](#proposed-solution:destructuring)
  - [negative numbers](#proposed-solution:negative-numbers)
  - [combinations](#proposed-solution:combinations)
- [Specification](#specification)
- [Implementation](#implementation)
  - [Paste](#implementation:paste)
  - [Import](#implementation:import)
- [Alternate Solution: Add Static Method to Number Object](#alternate-solution)
- [FAQ](#faq)  
  - [How does one interate between arbitrary integers?](#faq:arbitrary-integers)
  - [Does this cause language conflicts?](#faq:language-conflicts)

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

We can do away with most of the awkwardness using the [iterator protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) to make numbers iterable.
Given a number n, invoking `n[Symbol.iterator]` will return an iterator yielding 0 up to n - 1 (the sequence: 0, 1, ..., n - 1, n); or, in the case that n is negative, n up to -1 (the sequence: n, n + 1, ..., -2, -1).

This definition for negative number is useful as it allows a method of <a href="#faq:arbitrary-integers">iterating between two arbitrary integers</a>.

### <a name="proposed-solution:for-of"></a>for-of loop

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

#### <a name="side-note:set-theory"></a>set theory

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

### <a name="proposed-solution:infinite-loops"></a>infinite loops

Using ```Infinity``` as an iterator provides a convenient method for potentially infinite loops.

Compare what we might have done before:

```javascript
let i = 0;
while(true){
  //do something with i
  if(/*some condition*/){
    break;
  }
  i++;
}
```
to what we would do now

```javascript
for(const i of Infinity){
  //do something with i
  if(/*some condition*/){
    break;
  }
}
```

### <a name="proposed-solution:destructuring"></a>destructuring

Iterable numbers can be destructured as arrays.

```javascript
const [,one,,three] = Infinity;//
one;//1
three;//3
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

You can paste the following code into a console:

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
    return this;
  }
});
```

and then try out the above examples to see this proposal in action.

### <a name="implementation:import"></a>Import

You can import the included "make-numbers-iterable.js" into a project.

```javascript
import './make-numbers-iterable';
//...
```

and then try out the above examples to see this proposal in action.

## <a name="alternate-solution"></a>Alternate Solution: Add Static Method to Number Object

Alternatively, we might add an "interator" method to the Number object.

```javascript
for (const n of Number.iterator(number)){
  //do something with n
}
```

This can be implemented with the following code.

```javascript
Object.defineProperty(
Number,
"iterator",
{ value: function *(num){
    const max = Math.max(0, Math.floor(num));
    let i = Math.min(0, num);
    while(i < max) {
      yield i;
      i+=1;
    }
    return num;
  }
});
```

## <a name="faq"></a>FAQ

### <a name="faq:arbitrary-integers"></a>How does one interate between arbitrary integers?

Iterate up to the difference and add the smaller to each the iteration

```javascript
for(const i of (larger - smaller)){
  //do something with (smaller + i)
}
```

This will produce the sequence:

```javascript
[smaller, smaller + 1, ..., larger - 1]
```

Because of our definition for negative integers, it doesn't matter which numbers is smaller, as long as the [subtrahend](http://mathworld.wolfram.com/Subtrahend.html) is added to the iteration. The following code produces the same sequence as the code above:

```javascript
for(const i of (smaller - larger)){
  //do something with (larger + i )
}
```

### <a name="faq:language-conflicts"></a>Does this cause language conflicts?

Currently if a number is given where an iterator is expected, a type error is thrown:

```javascript
TypeError: (var)[Symbol.iterator] is not a function(…)
```

As such, this would not cause conflicts with existing working code.
