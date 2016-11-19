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
