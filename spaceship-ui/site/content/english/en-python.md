---
title: Variables in Python
description: Notes on Python variables and how values acquire types at runtime.
pubDate: 2022-09-26
category: software-engineering-cs
subcategory: python
type: study-note
tags:
- python
- variables
- data-types
- operators
researchFeatured: false
lang: en
slug: 2022-09-26-python
translationKey: en-2022-09-26-python
translatedPosts:
  ko-KR: 2022-09-26-python
---

## 📚 Variables

|Type|Description|Example|
|:--:|--:|:--:|
|Number|Holds numeric values such as integers or floating-point numbers|0, 1.25, or -231|
|String|Holds text|'string'|
|List|A collection that can hold different types of values|[1, 'hi', -123]|
|Tuple|An immutable sequence|(1, 'hi', -123)|
|Dictionary|Maps keys to values|{'name': 'python3'}|
|...|...|...|

_Python does not require a type declaration when you first use a variable._
* The object you assign to a name has a type.
* That type determines which operations and methods are available.

## 🔢 Numeric variables

|Operation|Symbol|Example|Value|
|:--:|:--:|:--:|:--:|
|Addition|+|4 + 5|9|
|Subtraction|-|5 - 4|1|
|Multiplication|*|5 * 4|20|
|Division|/|5/4|1.25|
|Exponentiation|**|5 ** 3|125|
|Remainder|%|11 % 6|5|
|Floor division|//|11//6|1|
|...|...|...|...|

## Numeric notation

|Notation|Marker|Example|Result|
|:--:|:--:|:--:|:--:|
|Octal|o|0o100|64|
|Hexadecimal|x|0x100|256|
|Exponential|E|12E2|1200|
|Complex|j|1+2j|1+2j|
