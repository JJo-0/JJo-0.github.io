---
title: Python’s defaultdict
description: A short guide to the dictionary subclass in Python’s collections module and how it handles missing
  keys.
pubDate: 2024-10-29
category: software-engineering-cs
subcategory: python
type: study-note
tags:
- python
- defaultdict
- collections
- data-structures
researchFeatured: false
lang: en
slug: 2024-10-29-python-1
translationKey: en-2024-10-29-python-1
translatedPosts:
  ko-KR: 2024-10-29-python-1
---

### Introduction
I recently read through a fairly long piece of machine vision code.
It used Python's defaultdict, which was new to me, so I wrote up how it works.

# What defaultdict does

**Definition:** defaultdict is a dictionary subclass in Python's collections module.\
**Behavior:** When you look up a missing key using square brackets, a defaultdict with a default factory creates and stores an initial value.\
**Typical uses:** It is handy for accumulating large datasets without initializing every key by hand and for avoiding KeyError on missing entries.

## When to use defaultdict

### 1. Appending a value without first initializing the key

**Skipping the setup**\
A regular dictionary needs an initialization step.

```python
from collections import defaultdict

hobbies = defaultdict(list)
hobbies['James'].append('Piano')
hobbies['Bob'].append('Soccer')

# Output: defaultdict(<class 'list'>, {'James': ['Piano'], 'Bob': ['Soccer']})
print(hobbies)
```
Looking up a new person's name creates a list for that person's hobbies.

### 2. Using a default value for missing keys

**Supplying zero as the default**

```python
scores = defaultdict(int)
print(scores['Tom']) # Output: 0. Tom has no entry, so the default factory supplies zero.
```

With zero as the default, looking up a missing key returns zero.

### How to use defaultdict

```python
from collections import defaultdict

# Create a defaultdict with int as its default factory.
default_d = defaultdict(int)

# Looking up the missing key 'apple' creates a default value of zero.
print(default_d['apple']) # Output: 0
```

Built-in types such as list, set, int, and float can serve as the default_factory.
