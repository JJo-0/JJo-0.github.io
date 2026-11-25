---
title: Heap
description: An array-based priority-queue ADT and parent/child index formulas.
pubDate: 2024-05-02
category: software-engineering-cs
subcategory: data-structures
type: implementation
tags:
- heap
- priority-queue
- c
- algorithms
researchFeatured: false
lang: en
draft: false
slug: 2024-05-02-heap-copy
translationKey: series-heap-copy-20261109
translatedPosts:
  ko-KR: 2024-05-02-heap-copy
publicationTimeZone: UTC
showComments: false
series:
  id: data-structures-coding-tests
  order: 20240502
---


> **English edition note:** The two reference links were empty in the original. The index formulas below assume one-based indexing and integer division for the parent. The ADT listing is pseudocode.




# About heaps 
---
**Concept reference:** no link supplied in the original.    
**Binary tree reference:** no link supplied in the original.    
Implementations: array-based heaps and linked-list-based heaps
log(n): the height of a heap with n nodes
    
# Heap implementation
---
### 📚 Implementation   

##### 1. Priority-queue abstract data type (ADT)    
**Array-based heap**
```c
create() // Create a priority queue
init(q) // Initialize the priority queue
is_empty(q) // Check whether the priority queue is empty
is_full(q) // Check whether the priority queue is full
insert(q, item) // Insert item into the priority queue
delete(q) // Remove the highest-priority item from the priority queue
find(q) // Find the highest-priority item in the priority queue
```
   
###### Array heap

Left child: 2 * (parent index)  
Right child: 2 * (parent index) + 1  
Parent: (child index) / 2  



