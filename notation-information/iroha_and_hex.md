For anyone who is mystified about Iroha (and psst, there's also an explanation of Hex at the end):

1: Binary logarithm and binary inversion are very important to understand for Iroha. NOTE THAT BINARY LOGARITHM IS HERE NOT THE BASE-TWO LOGARITHM AND IS SIMILAR BUT DIFFERENT IN IMPORTANT WAYS. Binary logarithm maps a greater-than-zero number a * 2^b to b + a - 1, where a is chosen to be between zero and one. Binary exponentiation, which we only need to define binary inversion, is the inverse function of binary logarithm, so if the binary logarithm of x is y, the binary exponentiation of y is x. The binary inversion of x is the binary exponentiation of the negation of the binary logarithm of x.

2: Just like most notations are only good with numbers above zero, Iroha is only good with numbers above one. It has an equivalent to the minus sign (that's 見), but it also has an "inversion sign" that it uses on numbers less than one (that's 世). Similarly, it has a special symbol for zero (that's 日) and a special symbol for one (that's 山). As log as we're talking about special symbols, there's also a symbol for NaN (it's 今).

3: So, we have a number greater than one. How do we write it? We'll first take the binary logarithm twice. This gives us some number that could be anything. We'll then split into the round-to-zero (round-to-zero is what it sounds like; round up if negative, round down if positive) integer part and the absolute value of the remaining part.

The above step is already complex, but here are some examples. For example, if we start with 42, the binary logarithm is 5.3125, and the binary logarithm of that is 2.328125. The round-to-zero integer part is 2, and the absolute value of the remaining part is 0.328125. For another example, suppose we start with 1.4375. The binary logarithm is 0.4375, and the binary logarithm of that result is -1.25. The round-to-zero integer part is then -1, and the absolute value of the remaining part is 0.25. For a third example, suppose we start with 1.75. The binary logarithm is 0.75, and the binary logarithm of that result is -0.5. The round-to-zero integer part is then -0, and the absolute value of the remaining part is 0.5. Note that the distinction between the round-to-zero integer part being 0 and being -0 is important. If we did not draw this distinction, we would have ambiguity between, for example, 1.75 and 3. As the last example, if we start with 2, the binary logarithm is 1, and the binary logarithm of that result is 0. By convention we consider the round-to-zero integer part to be 0 rather than -0 in this case, and the absolute value of the remaining part is of course 0.

4: Recall that at this point we have an integer (with a distinction between 0 and -0) and a number between zero and one. We set aside the integer (we'll use it later) and take the number between zero and one. We subtract that number from 1 (that is, we calculate 1 - x where x is the number) and then take the binary inverse. This gives us a number that's at least one. If the number is one, we're done. Otherwise, the number is greater than one, and we go back to step 3.

5: The above process might terminate, but it also might give us an infinite chain of integers. To avoid this, we repeat at most five times. That is, after the fifth iteration, we just stop (this number five can be changed, of course).

6: What we have now is a bunch of special characters and integers. We translate the integers into characters via a translation table loosely based on the Japanese poem Iroha which contains each hiragana character exactly once. We then output everything we have in the order 見 if applicable, 世 if applicable, characters that translate the integers, one of 日山今 if applicable.

Table for small numbers: 0 = い, 1 = ろ, 2 = は, 3 = に, 4 = ほ, 5 = へ, 6 = と, 7 = ち, 8 = り, 9 = ぬ, 10 = る, -0 = く, -1 = や, -2 = ま, -3 = け, -4 = ふ, -5 = こ, -6 = え, -7 = て, -8 = あ, -9 = さ, -10 = き

Let's do an example. Specifically, let's do -42. This is negative, so we negate and remember we'll need the inversion sign 見. We then have 42. Applying the binary logarithm twice, we get 2.328125. We separate into 2 and 0.328125. After the subtraction from one and subsequent binary inversion of 0.328125, we get 1.65625. Applying the binary logarithm twice, we get -0.6875. We separate into -0 and 0.6875. After the subtraction from one and binary inversion, we get 3.5. Applying the binary logarithm twice, we get 0.75. We separate into 0 and 0.75. After the subtraction from one and binary inversion, we get 4. Applying the binary logarithm twice, we get 1. We separate into 1 and 0. After the subtraction from one and binary inversion, we get 1, so we're done. It took us four iterations. Our expected result is thus 見はくいろ. This manages to be correct, though I made two mistakes doing it in my head.

You've gotten this far, so I'll explain Hex too. Hex is much simpler. You see, every day you get six spells, which you can use via understanding spellcharts... wait, wrong thing called Hex. For Hex notation, you just note the sign (zero is considered positive). If the sign is positive, you take the binary logarithm and return to the beginning. If the sign is negative, you negate, take the binary logarithm, negate, and return to the beginning. In theory, you do this infinitely many times (stopping if you take the binary logarithm of zero, which is understood to be negative infinity), interpret the signs as a binary fraction with minus signs being 0 and plus signs being 1, round to the nearest eight-digit (32-bit) hexadecimal fraction (ties are broken by rounding to the option with an even last digit, so a number equal to the hexadecimal fraction .012345678 would be rounded to .01234568), and remove the decimal point and pad to eight digits. In practice, you only need to do this about 40 times rather than infinite times for the answer to almost never be wrong. In a combination of theory and practice, you only need to do this 32 times and add one due to rounding under certain conditions which are easy to check. (Also, there's a slight difference between this algorithm and how the AD Notations library does it, but the result is the same. I'm not sure which is faster and also not sure which is clearer.) As a special case, infinity, which corresponds to the binary fraction 1, is written as FFFFFFFF, so that every number is eight digits and it's not confused with 00000000 (which is negative infinity). (If you're using few enough characters or big enough numbers that this makes it seem like Infinity is equal to some other relevant finite number, you might want to do something else, but even FF000000 is bigger than ee10000 and FFF00000 is bigger than eeeeee10000, so this almost certainly isn't relevant.)

Note that due to taking the binary logarithm of a positive number being monotone increasing and the composition of negating, taking the binary logarithm, and negating a negative number also being monotone increasing, Hex notation has the desirable property that if one number a has a representation in Hex notation that is less than the representation of some other number b as eight-digit hexadecimal numbers, then a is less than b.

Let's do -42 as an example here too. -42 is negative so we get a minus sign. When we negate, take the binary logarithm, and negate, we get -5.3125. -5.3125 is negative so we get a minus sign. When we negate, take the binary logarithm, and negate, we get -2.328125. -2.328125 is negative so we get a minus sign. When we negate, take the binary logarithm, and negate, we get -1.1640625. -1.1640625 is negative so we get a minus sign. When we negate, take the binary logarithm, and negate, we get -0.1640625. -0.1640625 is negative so we get a minus sign. When we negate, take the binary logarithm, and negate, we get 2.6875. 2.6875 is positive so we get a plus sign. When we take the binary logarithm, we get 1.34375. 1.34375 is positive so we get a plus sign. When we take the binary logarithm, we get 0.34375. 0.34375 is positive so we get a plus sign. When we take the binary logarithm, we get -1.625. -1.625 is negative so we get a minus sign. When we negate, take the binary logarithm, and negate, we get -0.625. -0.625 is negative so we get a minus sign. When we negate, take the binary logarithm, and negate, we get 0.75. 0.75 is positive so we get a plus sign. When we take the binary logarithm, we get -0.5. -0.5 is negative so we get a minus sign. When we negate, take the binary logarithm, and negate, we get 1. 1 is positive so we get a plus sign.  When we take the binary logarithm, we get 0. 0 is considered positive so we get a plus sign. We now take the binary logarithm of 0, which stops the loop. The signs we now have are minus, minus, minus, minus, minus, plus, plus, plus, minus, minus, plus, minus, plus, plus, which becomes the binary fraction .00000111001011, which becomes the hexadecimal fraction .072C, which becomes 072C0000. And indeed this is what we get. I did some but not all of this one in my head. When writing this type of conversion out it's generally more convenient to use binary fractions than to use decimal fractions (the binary logarithm maps binary fractions to binary fractions in a relatively easy-to-handle way).

Here's an implementation of Hex notation for normal Javascript numbers (not Decimals). `hexChars` is usually 8 but can be decreased or increased. There's also inversion of Hex notation. There are quite possibly bugs but I don't know of any (other than normal Javascript numbers not going high enough or not having enough precision). The
```javascript
if (h !== Math.pow(16, hexChars) - 1 && (n > 0 || (n === 0 && h % 2 === 1))) {
  h += 1;
}
```
is probably the most confusing part. Basically, `h !== Math.pow(16, hexChars)` avoids Infinity being written as 100000000, `n > 0` means we should round up, and `n === 0 && h % 2 === 1` means both rounding up and rounding down have the same distance but since we round to even we should round up.

```javascript
function binaryLogarithm(x) {
  let e = Math.floor(Math.log2(x));
  let m = isFinite(x) ? x / Math.pow(2, e) : 1;
  return (m - 1) + e;
}

function binaryExponential(x) {
  let e = Math.floor(x);
  let m = isFinite(x) ? 1 + (x - e) : 1;
  return m * Math.pow(2, e);
}

function toHex(n, hexChars) {
  let h = 0;
  for (let i = 0; i < hexChars * 4; i++) {
    h *= 2;
    if (n >= 0) {
      h += 1;
      n = binaryLogarithm(n);
    } else {
      n = -binaryLogarithm(-n);
    }
  }
  if (h !== Math.pow(16, hexChars) - 1 && (n > 0 || (n === 0 && h % 2 === 1))) {
    h += 1;
  }
  return h.toString(16).toUpperCase().padStart(hexChars, '0');
}

function fromHex(s) {
  let bits = s.length * 4;
  let h = parseInt(s, 16);
  let n = -Infinity;
  for (let i = 0; i < bits; i++) {
    let b = h % 2;
    if (b) {
      n = binaryExponential(n);
    } else {
      n = -binaryExponential(-n);
    }
    h = (h - b) / 2;
  }
  return n;
}
```
